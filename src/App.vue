<template>
  <div class="app">
    <h1>抽奖组件示例</h1>
    <common-lottery
      :lottery-config="lotteryConfig"
      v-model:winningId="winningId"
      @start="onStart"
      @end="onEnd"
      @stopped="onStopped"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import CommonLottery from 'common-lottery'
import CommonLottery from './components/common-lottery.vue'

const lotteryConfig = {
  canLottery: true,
  prizeList: [
    { id: 'prize1', name: '一等奖'},
    { id: 'prize2', name: '二等奖' },
    { id: 'prize3', name: '三等奖'},
    { id: 'prize4', name: '参与奖'},
    { id: 'prize5', name: '幸运奖'},
    { id: 'prize6', name: '安慰奖'},
    { id: 'prize7', name: '红包'},
    { id: 'prize8', name: '再来一次'},
    { id: 'prize9', name: '美食券'},
    // { id: 'prize10', name: '电影票', iconUrl: 'https://img.icons8.com/color/48/000000/ticket.png' },
    // { id: 'prize11', name: '咖啡券', iconUrl: 'https://img.icons8.com/color/48/000000/coffee-to-go.png' },
    // { id: 'prize12', name: '购物卡', iconUrl: 'https://img.icons8.com/color/48/000000/shopping-cart.png' },
    // { id: 'prize13', name: '水杯', iconUrl: 'https://img.icons8.com/color/48/000000/water-bottle.png' },
    // { id: 'prize14', name: '雨伞', iconUrl: 'https://img.icons8.com/color/48/000000/umbrella.png' },
    // { id: 'prize15', name: '鼠标垫', iconUrl: 'https://img.icons8.com/color/48/000000/mouse.png' },
    // { id: 'prize16', name: 'U盘', iconUrl: 'https://img.icons8.com/color/48/000000/usb.png' },
    // { id: 'prize17', name: '蓝牙耳机', iconUrl: 'https://img.icons8.com/color/48/000000/headphones.png' },
    // { id: 'prize18', name: '手环', iconUrl: 'https://img.icons8.com/color/48/000000/smart-watch.png' },
    // { id: 'prize19', name: '充电宝', iconUrl: 'https://img.icons8.com/color/48/000000/power-bank.png' },
    // { id: 'prize20', name: '谢谢参与', iconUrl: 'https://img.icons8.com/color/48/000000/cancel.png' }
  ]
}

const winningId = ref<string | undefined>('')

function onStart() {
  // winningId的重置已移至子组件处理
}

function onStopped() {
  console.error('stoped')
}

function onEnd() {
  // 模拟异步获取中奖ID
  setTimeout(() => {
    const idx = Math.floor(Math.random() * lotteryConfig.prizeList.length)
    // winningId.value = lotteryConfig.prizeList[idx].id
    winningId.value = 'prize6'
  }, 1000)
}
</script>

<style>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
</style> 