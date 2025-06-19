# common-lottery

> **注意：如需样式生效，请在入口文件手动引入**
> ```js
> import 'common-lottery/dist/style.css'
> ```

![图片描述](https://raw.githubusercontent.com/Alexaa123/common-lottery/main/src/assets/demo.gif)

一个功能丰富的Vue 3抽奖转盘组件，支持自定义奖品、H5自适应、动态样式和灵活的交互。

该组件展示链接：https://raw.githubusercontent.com/Alexaa123/common-lottery/main/src/assets/demo.gif

## 安装

```bash
npm install common-lottery
```

## 使用方法

### 全局注册 (不推荐，Vue3推荐局部注册)

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import CommonLottery from 'common-lottery'
import 'common-lottery/dist/style.css'

const app = createApp(App)
app.use(CommonLottery)
app.mount('#app')
```

### 局部注册 (推荐)

```vue
<template>
  <div class="your-page">
    <common-lottery
      :lottery-config="lotteryConfig"
      v-model:winningId="winningId"
      @start="handleLotteryStart"
      @end="handleLotteryEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CommonLottery } from 'common-lottery'
import 'common-lottery/dist/style.css'

interface PrizeItem {
  id: string;
  name: string;
}

interface LotteryConfig {
  canLottery: boolean;
  prizeList: PrizeItem[];
}

const lotteryConfig: LotteryConfig = {
  canLottery: true,
  prizeList: [
    { 
      id: 'prize1', 
      name: '一等奖'
    },
    { 
      id: 'prize2', 
      name: '二等奖'
    },
  ]
}

const winningId = ref<string | undefined>('')

const handleLotteryStart = () => {
  console.log('抽奖开始！')
}

const handleLotteryEnd = () => {
  console.log('用户点击结束抽奖，等待中奖结果...')
}
</script>

<style>
/* 你的页面样式 */
</style>
```

## Props

| 属性名          | 类型                 | 默认值 | 说明                                                     |
| :-------------- | :------------------- | :----- | :------------------------------------------------------- |
| `lotteryConfig` | `{ canLottery: boolean; prizeList: PrizeItem[] }` | 无     | 抽奖配置对象。`canLottery` 控制按钮是否可点击；`prizeList` 是奖品数组，每个奖品包含 `id`, `name`, `iconUrl?`。 |
| `v-model:winningId` | `string \| undefined` | `undefined` | 双向绑定的中奖奖品ID。开始抽奖时子组件会重置为 `undefined`，父组件在 `end` 事件后传入具体ID以停止转盘。 |

## 事件

| 事件名           | 参数      | 说明                                                     |
| :--------------- | :-------- | :------------------------------------------------------- |
| `@start`         | `void`    | 用户点击"点击抽奖"按钮时触发。                            |
| `@end`           | `void`    | 用户点击"结束抽奖"按钮时触发，表示父组件需要提供中奖ID。  |
| `update:winningId` | `string \| undefined` | 用于 `v-model:winningId` 双向绑定，子组件会emit此事件来重置 `winningId`。 |
| `stopped`        | `void`    | 转盘完全停止时触发。                                      |

## 方法

### reset

通过ref获取组件实例后，可调用`reset()`方法将转盘复原为未抽奖状态。

**示例：**

```vue
<template>
  <common-lottery ref="lotteryRef" ... />
  <button @click="resetLottery">重置转盘</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const lotteryRef = ref()
function resetLottery() {
  lotteryRef.value?.reset()
}
</script>
```

## 特性

*   **H5自适应:** 转盘自动适应父容器宽度，高度等比例缩放，确保在移动端显示良好。
*   **动态扇形:** 奖品区域等分，支持20个固定颜色循环，确保视觉美观。
*   **字体自适应:** 奖品名称字体大小会根据奖品数量自动调整，保证完整显示。
*   **图片支持:** 每个奖品支持显示 `iconUrl` 传入的图片。
*   **灵活交互:** 支持"点击抽奖"开始转动，点击"结束抽奖"等待中奖ID并匀速停止。
*   **多次抽奖:** 支持重复进行抽奖。 