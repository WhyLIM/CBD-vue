<template>
    <div class="icon-demo">
        <h2>FontAwesome 图标使用示例</h2>

        <!-- 实心图标示例 -->
        <div class="icon-section">
            <h3>实心图标 (fas)</h3>
            <div class="icon-grid">
                <div class="icon-item">
                    <font-awesome-icon :icon="['fas', 'home']" size="2x" />
                    <span>首页</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fas', 'user']" size="2x" />
                    <span>用户</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fas', 'search']" size="2x" />
                    <span>搜索</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fas', 'database']" size="2x" />
                    <span>数据库</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fas', 'star']" size="2x" />
                    <span>收藏</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fas', 'download']" size="2x" />
                    <span>下载</span>
                </div>
            </div>
        </div>

        <!-- 品牌图标示例 -->
        <div class="icon-section">
            <h3>品牌图标 (fab)</h3>
            <div class="icon-grid">
                <div class="icon-item">
                    <font-awesome-icon :icon="['fab', 'github']" size="2x" />
                    <span>GitHub</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fab', 'vue']" size="2x" />
                    <span>Vue.js</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fab', 'js']" size="2x" />
                    <span>JavaScript</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fab', 'html5']" size="2x" />
                    <span>HTML5</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fab', 'css3-alt']" size="2x" />
                    <span>CSS3</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['fab', 'python']" size="2x" />
                    <span>Python</span>
                </div>
            </div>
        </div>

        <!-- 常规图标示例 -->
        <div class="icon-section">
            <h3>常规图标 (far)</h3>
            <div class="icon-grid">
                <div class="icon-item">
                    <font-awesome-icon :icon="['far', 'heart']" size="2x" />
                    <span>喜欢</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['far', 'bookmark']" size="2x" />
                    <span>书签</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['far', 'file']" size="2x" />
                    <span>文件</span>
                </div>
                <div class="icon-item">
                    <font-awesome-icon :icon="['far', 'envelope']" size="2x" />
                    <span>邮件</span>
                </div>
            </div>
        </div>

        <!-- 图标样式示例 -->
        <div class="icon-section">
            <h3>图标样式示例</h3>
            <div class="style-examples">
                <div class="style-item">
                    <font-awesome-icon :icon="['fas', 'star']" class="text-yellow" />
                    <span>黄色星星</span>
                </div>
                <div class="style-item">
                    <font-awesome-icon :icon="['fas', 'heart']" class="text-red" spin />
                    <span>红色旋转心形</span>
                </div>
                <div class="style-item">
                    <font-awesome-icon :icon="['fas', 'spinner']" pulse />
                    <span>脉冲加载</span>
                </div>
                <div class="style-item">
                    <font-awesome-icon :icon="['fas', 'cog']" spin />
                    <span>旋转齿轮</span>
                </div>
            </div>
        </div>

        <!-- 使用说明 -->
        <div class="usage-info">
            <h3>使用说明</h3>
            <pre><code>
<!-- 基本用法 -->
&lt;font-awesome-icon :icon="['fas', 'home']" /&gt;

<!-- 设置大小 -->
&lt;font-awesome-icon :icon="['fas', 'user']" size="2x" /&gt;

<!-- 添加动画 -->
&lt;font-awesome-icon :icon="['fas', 'spinner']" spin /&gt;
&lt;font-awesome-icon :icon="['fas', 'heart']" pulse /&gt;

<!-- 添加样式类 -->
&lt;font-awesome-icon :icon="['fas', 'star']" class="text-yellow" /&gt;
      </code></pre>
        </div>
    </div>
</template>

<script setup>
// 无需导入，FontAwesome组件已在main.js中全局注册
</script>

<style scoped>
.icon-demo {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.icon-section {
    margin-bottom: 40px;
}

.icon-section h3 {
    color: #409eff;
    margin-bottom: 20px;
    border-bottom: 2px solid #409eff;
    padding-bottom: 10px;
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.icon-item:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
    transform: translateY(-2px);
}

.icon-item span {
    margin-top: 10px;
    font-size: 14px;
    color: #606266;
}

.style-examples {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
}

.style-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
}

.style-item span {
    margin-top: 10px;
    font-size: 12px;
    color: #909399;
}

.text-yellow {
    color: #f39c12;
}

.text-red {
    color: #e74c3c;
}

.usage-info {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #409eff;
}

.usage-info pre {
    background-color: #2d3748;
    color: #e2e8f0;
    padding: 15px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0;
}

.usage-info code {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
}
</style>