"""
PRS (Perturbation Response Scanning) 即时计算脚本
基于 enm_package (https://github.com/oacar/enm_package) 的 GNM + PRS 实现

输入（stdin JSON）:
{
  "edges": [["GENE1","GENE2"], ...],
  "cluster": true | false   // 是否运行 cluster_matrix，默认 false
}

输出（stdout JSON）:
{
  "success": true,
  "data": {
    "nodes": ["GENE1", ...],          // 巨组分组内的节点
    "metrics": [
      { "gene": "...", "deg": ..., "eff": ..., "sens": ...,
        "trans": ..., "eigenvec_centr": ..., "closeness_centr": ... }
    ],
    "elapsed_ms": { "gnm": ..., "prs": ..., "cluster": ... }
  }
}

错误时:
{ "success": false, "error": "..." }
"""
import sys, os, json, time, contextlib, io

# 引入本地 vendor/enm_package
HERE = os.path.dirname(os.path.abspath(__file__))
VENDOR = os.path.normpath(os.path.join(HERE, "..", "vendor"))
sys.path.insert(0, VENDOR)

# 屏蔽 prody 日志
sys.stderr = io.StringIO()

MAX_NODES = 500  # 上限保护

def main():
    raw = sys.stdin.read()
    if not raw.strip():
        print(json.dumps({"success": False, "error": "空输入"}))
        return

    try:
        payload = json.loads(raw)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"JSON 解析失败: {e}"}))
        return

    edges = payload.get("edges") or []
    do_cluster = bool(payload.get("cluster", False))

    if not isinstance(edges, list) or len(edges) < 1:
        print(json.dumps({"success": False, "error": "edges 必须是非空数组"}))
        return

    # 规整边并预检节点数
    clean_edges = []
    node_set = set()
    for e in edges:
        if not isinstance(e, list) or len(e) != 2:
            continue
        a, b = str(e[0]).strip(), str(e[1]).strip()
        if not a or not b or a == b:
            continue
        clean_edges.append((a, b))
        node_set.add(a); node_set.add(b)

    if len(node_set) > MAX_NODES:
        print(json.dumps({
            "success": False,
            "error": f"节点数 {len(node_set)} 超过上限 {MAX_NODES}，请缩小网络规模"
        }))
        return

    if not clean_edges:
        print(json.dumps({"success": False, "error": "没有有效边"}))
        return

    # 节点数过少时 prody GNM 无法求解（特征值退化），提前拦截
    if len(node_set) < 3:
        print(json.dumps({
            "success": False,
            "error": f"网络节点数 {len(node_set)} 过少（< 3），无法进行 GNM/PRS 分析"
        }))
        return

    # 临时 tsv 文件
    import tempfile
    fd, tmp_path = tempfile.mkstemp(suffix=".tsv")
    os.close(fd)
    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write("gene1\tgene2\n")
            for a, b in clean_edges:
                f.write(f"{a}\t{b}\n")

        # 延迟 import，让上面的参数校验先返回快速错误
        from enm_package.enm.Enm import Enm

        enm = Enm("web_prs")
        enm.read_network(tmp_path, sep="\t")

        t0 = time.perf_counter()
        with contextlib.redirect_stdout(io.StringIO()):
            enm.gnm_analysis()
        t_gnm = (time.perf_counter() - t0) * 1000

        t_cluster = 0.0
        if do_cluster:
            t0 = time.perf_counter()
            enm.cluster_matrix(enm.prs_mat)
            t_cluster = (time.perf_counter() - t0) * 1000

        df = enm.df.copy()
        # 按 sens 降序
        df = df.sort_values("sens", ascending=False)

        metrics = []
        for _, row in df.iterrows():
            metrics.append({
                "gene": str(row["orf_name"]),
                "deg": float(row["deg"]),
                "eff": float(row["eff"]),
                "sens": float(row["sens"]),
                "trans": float(row["trans"]),
                "eigenvec_centr": float(row["eigenvec_centr"]),
                "closeness_centr": float(row["closeness_centr"]),
            })

        result = {
            "success": True,
            "data": {
                "nodes": list(enm.nodes),
                "metrics": metrics,
                "elapsed_ms": {
                    "gnm": round(t_gnm, 1),
                    "cluster": round(t_cluster, 1),
                },
            },
        }
        print(json.dumps(result, ensure_ascii=False))
    finally:
        try: os.unlink(tmp_path)
        except Exception: pass


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"success": False, "error": f"内部错误: {e}"}))
