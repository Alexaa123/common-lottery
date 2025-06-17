<template>
  <div class="lottery-container">
    <div class="lottery-wheel-wrapper">
      <!-- 指针 -->
      <div class="lottery-pointer"></div>
      <!-- SVG转盘 -->
      <svg
        class="lottery-wheel"
        :style="wheelStyle"
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <g v-for="(item, index) in displayItems" :key="item.id">
          <image
            v-if="item.iconUrl"
            :href="item.iconUrl"
            :x="200 + 110 * Math.cos((index + 0.5) * 2 * Math.PI / displayItems.length - Math.PI / 2) - 20"
            :y="200 + 110 * Math.sin((index + 0.5) * 2 * Math.PI / displayItems.length - Math.PI / 2) - 40"
            width="40"
            height="40"
            style="pointer-events: none;"
          />
          <path
            :d="getSectorPath(index, displayItems.length)"
            :fill="sectorColors[index % 20]"
            stroke="#fff"
            stroke-width="2"
          />
          <text
            :x="200 + 110 * Math.cos((index + 0.5) * 2 * Math.PI / displayItems.length - Math.PI / 2)"
            :y="200 + 110 * Math.sin((index + 0.5) * 2 * Math.PI / displayItems.length - Math.PI / 2)"
            text-anchor="middle"
            alignment-baseline="middle"
            :transform="`rotate(${(index + 0.5) * 360 / displayItems.length},${200 + 110 * Math.cos((index + 0.5) * 2 * Math.PI / displayItems.length - Math.PI / 2)},${200 + 110 * Math.sin((index + 0.5) * 2 * Math.PI / displayItems.length - Math.PI / 2)})`"
            class="prize-name"
            :style="getPrizeTextStyle"
          >
            {{ item.name }}
          </text>
        </g>
        <!-- 中心圆 -->
        <circle cx="200" cy="200" r="30" fill="#fff" stroke="#eee" stroke-width="4" />
      </svg>
    </div>
    <button
      class="lottery-button"
      :class="{ running: isRunning }"
      @click="handleButtonClick"
      :disabled="!props.lotteryConfig.canLottery"
    >
      {{
        !isRunning ? '点击抽奖' : '结束抽奖'
      }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface PrizeItem {
  id: string
  name: string
  iconUrl?: string
}

interface LotteryConfig {
  canLottery: boolean
  prizeList: PrizeItem[]
}

const props = defineProps<{
  lotteryConfig: LotteryConfig
  winningId?: string
}>()

const emit = defineEmits<{
  (e: 'start'): void
  (e: 'end'): void
  (e: 'update:winningId', id?: string): void
  (e: 'stopped'): void
}>()

const isRunning = ref(false)
const isWaitingResult = ref(false)
const currentRotation = ref(0)
let rotateTimer: number | null = null
let currentSpeed = 8; // 初始转速
const minSpeed = 2; // 最小转速
const deceleration = 0.15; // 每帧减速量
let isSlowing = false;
let slowDownFrameId: number | null = null;
let slowDownStartTime: number | null = null;
const slowDownDuration = 3000; // 6秒减速时间
let initialSpeed: number | null = null;
let pendingWinnerId: string | null = null;
let slowDownTimeout: number | null = null;

const displayItems = computed(() => {
  const items = [...props.lotteryConfig.prizeList]
  if (items.length % 2 !== 0) {
    items.push({ id: 'thanks', name: '谢谢参与' })
  }
  return items
})

// 固定20色数组
const sectorColors = [
  '#FFD700', '#FFB347', '#FF6961', '#77DD77', '#AEC6CF',
  '#CBAACB', '#B39EB5', '#779ECB', '#FFB7B2', '#FFDAC1',
  '#E2F0CB', '#B5EAD7', '#C7CEEA', '#FF9AA2', '#FFCCF9',
  '#B5B9FF', '#D5AAFF', '#A0E7E5', '#FFAEBC', '#A0E7E5'
]

const itemAngle = computed(() => 360 / displayItems.value.length)

const wheelStyle = computed(() => ({
  transform: `rotate(${currentRotation.value}deg)`,
  transition: 'none'
}))

function getSectorPath(index: number, total: number) {
  const angle = 2 * Math.PI / total
  const startAngle = index * angle - Math.PI / 2
  const endAngle = startAngle + angle
  const r = 180
  const x1 = 200 + r * Math.cos(startAngle)
  const y1 = 200 + r * Math.sin(startAngle)
  const x2 = 200 + r * Math.cos(endAngle)
  const y2 = 200 + r * Math.sin(endAngle)
  return `M200,200 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`
}

// 字体自适应
const getPrizeTextStyle = computed(() => {
  const count = displayItems.value.length
  let fontSize = 18
  if (count > 16) fontSize = 10
  else if (count > 8) fontSize = 14
  return { fontSize: fontSize + 'px', fontWeight: 'bold', userSelect: 'none' }
})

function startLottery() {
  if (isRunning.value) return
  isRunning.value = true
  isWaitingResult.value = false
  if (rotateTimer) clearInterval(rotateTimer)
  if (slowDownFrameId) cancelAnimationFrame(slowDownFrameId)
  currentSpeed = 8;
  isSlowing = false;
  rotateTimer = window.setInterval(() => {
    currentRotation.value = (currentRotation.value + currentSpeed) % 360
    if (currentSpeed < 12) {
      currentSpeed += 0.1;
    }
  }, 16)
  emit('update:winningId', undefined)
  emit('start')
}

function stopLottery() {
  if (!isRunning.value || isWaitingResult.value) return
  isWaitingResult.value = true
  isSlowing = true
  if (rotateTimer) clearInterval(rotateTimer)
  initialSpeed = currentSpeed;
  slowDownStartTime = performance.now();
  pendingWinnerId = null;
  if (slowDownTimeout) clearTimeout(slowDownTimeout);
  slowDown()
  // 3秒后检查 winnerId
  slowDownTimeout = window.setTimeout(() => {
    if (pendingWinnerId) {
      // 3秒内已拿到winnerId，3秒到后再停
      stopAtWinner(pendingWinnerId)
      pendingWinnerId = null;
    } else {
      // 3秒后还没winnerId，保持最低速
      currentSpeed = minSpeed;
    }
  }, slowDownDuration);
  emit('end')
}

function slowDown() {
  function frame() {
    if (!isSlowing) return;
    const now = performance.now();
    const elapsed = now - (slowDownStartTime || now);
    if (elapsed < slowDownDuration) {
      // 在6秒内，速度逐渐降低
      const progress = elapsed / slowDownDuration;
      currentSpeed = (initialSpeed || 8) - ((initialSpeed || 8) - minSpeed) * progress;
    } else {
      // 6秒后，保持最小速度
      currentSpeed = minSpeed;
    }
    currentRotation.value = (currentRotation.value + currentSpeed) % 360;
    slowDownFrameId = requestAnimationFrame(frame);
  }
  frame();
}

function handleButtonClick() {
  if (!isRunning.value) {
    startLottery()
  } else if (!isWaitingResult.value) {
    stopLottery()
  }
}

watch(() => props.winningId, (newId: string | undefined) => {
  if (!isRunning.value || !isWaitingResult.value || !newId) return
  const now = performance.now();
  const elapsed = now - (slowDownStartTime || now);
  if (elapsed < slowDownDuration) {
    // 3秒内，winnerId先到，记录下来，等3秒到再停
    pendingWinnerId = newId;
  } else {
    // 3秒后才到，立即停
    stopAtWinner(newId);
  }
})

function stopAtWinner(winnerId: string) {
  isSlowing = false;
  if (slowDownFrameId) cancelAnimationFrame(slowDownFrameId);
  const targetIndex = displayItems.value.findIndex((item: PrizeItem) => item.id === winnerId)
  if (targetIndex === -1) return
  const targetAngle = 360 - (targetIndex * itemAngle.value + itemAngle.value / 2)
  let start = currentRotation.value % 360
  let delta = (targetAngle - start + 360) % 360
  let duration = (delta / currentSpeed) * 16 // 使用当前转速计算动画时长
  const startTime = performance.now()
  function animate(now: number) {
    const elapsed = now - startTime
    if (elapsed >= duration) {
      currentRotation.value = targetAngle
      isRunning.value = false
      isWaitingResult.value = false
      emit('stopped')
      return
    }
    const progress = elapsed / duration
    currentRotation.value = start + delta * progress
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3)
}
</script>

<style scoped>
.lottery-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lottery-wheel-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1/1;
  margin-bottom: 30px;
}

.lottery-pointer {
  position: absolute;
  left: 50%;
  top: calc(50% - 30px - 40px); /* 50% - 圆半径 - 三角形高 */
  width: 0;
  height: 0;
  border-left: 18px solid transparent;
  border-right: 18px solid transparent;
  border-bottom: 40px solid #FFD700;
  transform: translateX(-50%);
  z-index: 20;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.lottery-wheel {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  box-shadow: 0 0 30px #e5e1d8, 0 0 20px rgba(0,0,0,0.08);
  background: #fff;
}

.prize-name {
  font-size: 18px;
  font-weight: bold;
  fill: #8a6d1b;
  pointer-events: none;
  user-select: none;
}

.lottery-button {
  margin-top: 10px;
  padding: 12px 30px;
  font-size: 18px;
  color: white;
  background-color: #FFD700;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  letter-spacing: 2px;
}

.lottery-button:hover:not(:disabled) {
  background-color: #e6be00;
  transform: scale(1.05);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.lottery-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

.lottery-button.running {
  background-color: #cccccc;
  color: #fff;
  cursor: pointer;
}

.lottery-button.running:hover {
  background-color: #cccccc;
  transform: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 