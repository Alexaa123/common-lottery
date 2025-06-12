import { App } from 'vue'
import CommonLottery from './components/common-lottery.vue'

export { CommonLottery }

(CommonLottery as any).install = (app: App) => {
  app.component('CommonLottery', CommonLottery)
}

export default CommonLottery 