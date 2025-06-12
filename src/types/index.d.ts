declare module 'common-lottery' {
  import { App } from 'vue'
  import CommonLottery from './components/common-lottery.vue'

  export { CommonLottery }

  const install: (app: App) => void
  export default { install }
} 