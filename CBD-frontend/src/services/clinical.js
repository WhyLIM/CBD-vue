import api from '@/utils/api'

export default {
  getDiagnosis(params) { return api.get('/clinical/diagnosis', { params }) },
  getSurvival(params) { return api.get('/clinical/survival', { params }) },
  getImmune(params) { return api.get('/clinical/immune', { params }) }
}
