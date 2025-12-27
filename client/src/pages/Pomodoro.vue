<template>
  <div class="pomodoro" :class="{ 'dark-mode-active': isSimpleDark }">
    <div class="grid grid-cols-3 items-center">
      <div class="text-left">
        <button class="back-btn" @click="$router.back()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          返回上一页
        </button>
      </div>
      <div class="text-center">
        <h2>学习番茄钟</h2>
      </div>
      <div></div>
    </div>

    <div class="layout">
      <div class="left">
        <section class="block">
          <h3>计时器</h3>
          <div class="timer">
            <template v-if="settings.timerStyle==='ring'">
              <div class="ring" :style="progressStyle">
                <div class="ring-inner">
                  <div class="clock">{{ timeText }}</div>
                  <div class="mode">{{ modeText }}</div>
                  <div class="round">第 {{ currentRound }} / {{ settings.rounds }} 轮</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="bar-timer">
                <div class="clock">{{ timeText }}</div>
                <div class="mode">{{ modeText }}</div>
                <div class="round">第 {{ currentRound }} / {{ settings.rounds }} 轮</div>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: progressPercent + '%', backgroundColor: accentColor }"></div>
                </div>
              </div>
            </template>
            <div class="controls">
              <button v-if="!running" @click="start">开始</button>
              <button v-else @click="pause">暂停</button>
              <button @click="resetTimer">重置计时</button>
              <button @click="skip">跳过本阶段</button>
            </div>
          </div>
          <div class="settings-merge">
            <h4>设置</h4>
            <div class="rows settings-line">
              <label>专注时长（分钟）</label>
              <input type="number" min="1" v-model.number="settings.focusMinutes" />
              <label>休息时长（分钟）</label>
              <input type="number" min="1" v-model.number="settings.breakMinutes" />
              <label>轮数</label>
              <input type="number" min="1" v-model.number="settings.rounds" />
              <label>样式</label>
              <select v-model="settings.timerStyle">
                <option value="ring">环形</option>
                <option value="bar">进度条</option>
              </select>
            </div>
            <div class="rows rows-actions">
              <button @click="saveSettings">保存设置</button>
              <button @click="resetAll" class="danger">重置数据</button>
            </div>
          </div>
        </section>
      </div>
      <div class="right">
        <div class="card">
          <h3>日记</h3>
          <div class="rows">
            <label>日期</label>
            <input type="date" v-model="diaryDate" />
          </div>
          <textarea v-model="diaryText" rows="6" placeholder="记录今天的学习内容、心得..."></textarea>
          <div class="rows">
            <button @click="saveDiary">保存日记</button>
            <button @click="loadDiary">读取</button>
          </div>
        </div>

        <div class="card">
          <h3>待办事项</h3>
          <div class="todo-input">
            <input v-model.trim="newTodo" type="text" placeholder="输入待办并添加" />
            <button @click="addTodo" :disabled="!newTodo">添加</button>
          </div>
          <transition-group name="todo" tag="ul" class="todo-list">
            <li v-for="item in todos" :key="item.id" :class="{ done: item.done }">
              <input type="checkbox" v-model="item.done" @change="persist()" />
              <span>{{ item.text }}</span>
              <button class="del" @click="removeTodo(item.id)">删除</button>
            </li>
          </transition-group>
        </div>

        <div class="card">
          <h3>学习日历</h3>
          <div class="calendar">
            <div class="cal-head">
              <button @click="prevMonth">上个月</button>
              <span>{{ calYear }} 年 {{ (calMonth + 1) }} 月</span>
              <button @click="nextMonth">下个月</button>
            </div>
            <div class="cal-grid">
              <div class="cell head" v-for="w in weeks" :key="'w'+w">{{ w }}</div>
              <div
                v-for="d in calCells"
                :key="'d'+d.key"
                class="cell"
                :class="{ out: d.out, checked: isChecked(d.dateStr), pulse: d.dateStr===pulseDate }"
                @click="toggleCheck(d.dateStr)"
              >
                {{ d.day }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>

<script>
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { storeToRefs } from 'pinia'

export default {
  name: 'PomodoroPage',
  setup() {
    const authStore = useAuthStore()
    const themeStore = useThemeStore()
    const { user } = storeToRefs(authStore)
    const { isSimpleDark } = storeToRefs(themeStore)
    return { user, isSimpleDark }
  },
  data() {
    return {
      settings: { focusMinutes: 25, breakMinutes: 5, rounds: 4, timerStyle: 'ring' },
      running: false,
      mode: 'focus',
      secondsLeft: 25 * 60,
      currentRound: 1,
      tickId: null,
      newTodo: '',
      todos: [],
      diaryDate: new Date().toISOString().slice(0, 10),
      diaryText: '',
      checkins: [],
      calYear: new Date().getFullYear(),
      calMonth: new Date().getMonth(),
      weeks: ['一', '二', '三', '四', '五', '六', '日'],
      pulseDate: ''
    }
  },
  computed: {
    storeKey() {
      const u = this.user
      return u ? `blog_pomodoro_u${u.id}` : 'blog_pomodoro_guest'
    },
    timeText() {
      const m = Math.floor(this.secondsLeft / 60)
      const s = this.secondsLeft % 60
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    },
    modeText() {
      return this.mode === 'focus' ? '专注中' : '休息中'
    },
    focusBaseSeconds() {
      return this.settings.focusMinutes * 60
    },
    breakBaseSeconds() {
      return this.settings.breakMinutes * 60
    },
    progressStyle() {
      const base = this.mode === 'focus' ? this.focusBaseSeconds : this.breakBaseSeconds
      const done = Math.max(0, Math.min(1, (base - this.secondsLeft) / base))
      const percent = Math.round(done * 100)
      const accent = this.mode === 'focus' ? '#10b981' : '#3b82f6'
      return { '--done': `${percent}%`, '--accent': accent }
    },
    progressPercent() {
      const base = this.mode === 'focus' ? this.focusBaseSeconds : this.breakBaseSeconds
      const done = Math.max(0, Math.min(1, (base - this.secondsLeft) / base))
      return Math.round(done * 100)
    },
    accentColor() {
      return this.mode === 'focus' ? '#10b981' : '#3b82f6'
    },
    calCells() {
      const first = new Date(this.calYear, this.calMonth, 1)
      const last = new Date(this.calYear, this.calMonth + 1, 0)
      const startIdx = (first.getDay() + 6) % 7
      const days = last.getDate()
      const cells = []
      // previous month filler
      for (let i = 0; i < startIdx; i++) {
        const d = new Date(this.calYear, this.calMonth, -i)
        cells.unshift({ day: d.getDate(), out: true, key: `p${i}`, dateStr: this.dateStr(d) })
      }
      // current month
      for (let i = 1; i <= days; i++) {
        const d = new Date(this.calYear, this.calMonth, i)
        cells.push({ day: i, out: false, key: `c${i}`, dateStr: this.dateStr(d) })
      }
      // next month filler to complete 6 rows
      while (cells.length % 7 !== 0 || cells.length < 42) {
        const n = cells.length - startIdx - days + 1
        const d = new Date(this.calYear, this.calMonth + 1, n)
        cells.push({ day: d.getDate(), out: true, key: `n${n}`, dateStr: this.dateStr(d) })
      }
      return cells
    }
  },
  watch: {
    storeKey: {
      immediate: true,
      handler() {
        this.loadData()
      }
    }
  },
  methods: {
    maybeMigrateKeys() {
      const u = this.user
      if (!u || !u.username || !u.id) return
      const oldKey = `blog_pomodoro_${u.username}`
      const newKey = this.storeKey
      try {
        const oldMain = localStorage.getItem(oldKey)
        const hasNewMain = !!localStorage.getItem(newKey)
        if (oldMain && !hasNewMain) {
          localStorage.setItem(newKey, oldMain)
        }
        const oldStatsKey = `${oldKey}_stats`
        const newStatsKey = `${newKey}_stats`
        const oldStats = localStorage.getItem(oldStatsKey)
        const hasNewStats = !!localStorage.getItem(newStatsKey)
        if (oldStats && !hasNewStats) {
          localStorage.setItem(newStatsKey, oldStats)
        }
        const oldDiaryKey = `${oldKey}_diary`
        const newDiaryKey = `${newKey}_diary`
        const oldDiary = localStorage.getItem(oldDiaryKey)
        const hasNewDiary = !!localStorage.getItem(newDiaryKey)
        if (oldDiary && !hasNewDiary) {
          localStorage.setItem(newDiaryKey, oldDiary)
        }
      } catch {}
    },
    loadData() {
      this.maybeMigrateKeys()
      const saved = JSON.parse(localStorage.getItem(this.storeKey) || '{}')
      this.settings = {
        focusMinutes: saved.settings?.focusMinutes ?? 25,
        breakMinutes: saved.settings?.breakMinutes ?? 5,
        rounds: saved.settings?.rounds ?? 4,
        timerStyle: saved.settings?.timerStyle ?? 'ring'
      }
      this.todos = Array.isArray(saved.todos) ? saved.todos : []
      this.checkins = Array.isArray(saved.checkins) ? saved.checkins : []
      this.loadDiary()
      if (!this.running) {
        this.resetTimer()
      }
    },
    updateFocusStats(seconds) {
      const key = `${this.storeKey}_stats`
      const stats = JSON.parse(localStorage.getItem(key) || '{}')
      const today = this.dateStr(new Date())
      const prev = stats[today]?.focusSeconds || 0
      stats[today] = { focusSeconds: prev + seconds }
      const dates = Object.keys(stats).sort()
      const MAX_DAYS = 90
      if (dates.length > MAX_DAYS) {
        const toDelete = dates.slice(0, dates.length - MAX_DAYS)
        toDelete.forEach(d => { delete stats[d] })
      }
      localStorage.setItem(key, JSON.stringify(stats))
      try { window.dispatchEvent(new CustomEvent('pomodoro-updated', { detail: { key: this.storeKey } })) } catch {}
    },
    persist() {
      const data = {
        settings: this.settings,
        todos: this.todos,
        checkins: this.checkins
      }
      localStorage.setItem(this.storeKey, JSON.stringify(data))
      try { window.dispatchEvent(new CustomEvent('pomodoro-updated', { detail: { key: this.storeKey } })) } catch {}
    },
    saveSettings() {
      if (this.running) this.pause()
      this.secondsLeft = (this.mode === 'focus' ? this.settings.focusMinutes : this.settings.breakMinutes) * 60
      this.persist()
    },
    resetAll() {
      if (this.running) this.pause()
      this.settings = { focusMinutes: 25, breakMinutes: 5, rounds: 4 }
      this.currentRound = 1
      this.mode = 'focus'
      this.secondsLeft = this.settings.focusMinutes * 60
      this.todos = []
      this.checkins = []
      this.diaryText = ''
      this.persist()
    },
    start() {
      if (this.running) return
      this.running = true
      this.tickId = setInterval(() => {
        if (this.secondsLeft > 0) {
          this.secondsLeft--
        } else {
          this.nextPhase()
        }
      }, 1000)
    },
    pause() {
      this.running = false
      if (this.tickId) { clearInterval(this.tickId); this.tickId = null }
    },
    resetTimer() {
      const base = this.mode === 'focus' ? this.settings.focusMinutes : this.settings.breakMinutes
      this.secondsLeft = base * 60
    },
    skip() {
      this.nextPhase()
    },
    nextPhase() {
      if (this.mode === 'focus') {
        this.updateFocusStats(this.settings.focusMinutes * 60)
        const today = this.dateStr(new Date())
        if (!this.checkins.includes(today)) {
          this.checkins = [...this.checkins, today]
          this.persist()
        }
        this.playBell()
        this.mode = 'break'
        this.secondsLeft = this.settings.breakMinutes * 60
      } else {
        // completed break -> next round
        if (this.currentRound < this.settings.rounds) {
          this.currentRound++
          this.mode = 'focus'
          this.secondsLeft = this.settings.focusMinutes * 60
        } else {
          // all done
          this.pause()
          alert('恭喜完成本轮番茄钟！')
          this.mode = 'focus'
          this.currentRound = 1
          this.secondsLeft = this.settings.focusMinutes * 60
        }
      }
    },
    addTodo() {
      const id = Date.now() + Math.random()
      this.todos = [...this.todos, { id, text: this.newTodo, done: false }]
      this.newTodo = ''
      this.persist()
    },
    removeTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id)
      this.persist()
    },
    dateStr(d) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    isChecked(dateStr) {
      return this.checkins.includes(dateStr)
    },
    toggleCheck(dateStr) {
      const today = this.dateStr(new Date())
      if (dateStr !== today) { alert('只能对当天进行打卡'); return }
      if (this.isChecked(dateStr)) {
        this.checkins = this.checkins.filter(x => x !== dateStr)
      } else {
        this.checkins = [...this.checkins, dateStr]
      }
      this.persist()
      this.pulseDate = dateStr
      setTimeout(() => { this.pulseDate = '' }, 300)
    },
    prevMonth() {
      const d = new Date(this.calYear, this.calMonth - 1, 1)
      this.calYear = d.getFullYear()
      this.calMonth = d.getMonth()
    },
    nextMonth() {
      const d = new Date(this.calYear, this.calMonth + 1, 1)
      this.calYear = d.getFullYear()
      this.calMonth = d.getMonth()
    },
    saveDiary() {
      const key = `${this.storeKey}_diary`
      const all = JSON.parse(localStorage.getItem(key) || '{}')
      all[this.diaryDate] = this.diaryText
      localStorage.setItem(key, JSON.stringify(all))
    },
    loadDiary() {
      const key = `${this.storeKey}_diary`
      const all = JSON.parse(localStorage.getItem(key) || '{}')
      this.diaryText = all[this.diaryDate] || ''
    },
    playBell() {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext
        if (!Ctx) return
        const ctx = new Ctx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 880
        osc.connect(gain)
        gain.connect(ctx.destination)
        gain.connect(ctx.destination)
        const t = ctx.currentTime
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
        osc.start(t)
        osc.stop(t + 0.34)
      } catch (e) { void 0 }
    }
  },
  beforeUnmount() {
    if (this.tickId) clearInterval(this.tickId)
  }
}
</script>

<style scoped>
.pomodoro { max-width: 1080px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.pomodoro h2 { text-align: center; }
.layout { display: flex; gap: 16px; align-items: flex-start; }
.left { flex: 1; }
.right { width: 400px; display: flex; flex-direction: column; gap: 16px; }
.block { background: rgba(255,255,255,0.3); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.6); border-radius: 12px; padding: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.14); }
.rows { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.rows-actions { margin-top: 16px; justify-content: center; }
.rows input[type="number"] { width: 100px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 8px; }
.settings-merge .settings-line { flex-wrap: nowrap; gap: 12px; align-items: center; }
.settings-merge .settings-line label { white-space: nowrap; }
.settings-merge .settings-line input[type="number"] { width: 80px; }
.settings-merge .settings-line select { min-width: 100px; }
.rows button { padding: 8px 12px; background: #42b983; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease; }
.rows button:hover { transform: translateY(-1px); box-shadow: 0 6px 12px rgba(66,185,131,0.25); }
.rows button:active { transform: translateY(0); box-shadow: none; }
.rows .danger { background: #ef4444; }
.timer { display: flex; flex-direction: column; align-items: center; gap: 16px; justify-content: flex-start; }
.controls { margin-top: 10px; display: flex; gap: 10px; }
.ring { width: 280px; height: 280px; border-radius: 50%; background: conic-gradient(var(--accent) var(--done), #e5e7eb 0); position: relative; box-shadow: 0 10px 25px rgba(16,185,129,0.15); }
.ring-inner { position: absolute; inset: 12px; border-radius: 50%; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; box-shadow: inset 0 0 0 1px #f1f5f9; }
.mode { font-weight: 700; color: #374151; }
.clock { font-size: 36px; font-weight: 800; letter-spacing: 2px; color: #111827; }
.round { font-size: 12px; color: #6b7280; }
.bar-timer { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.bar-track { width: 100%; max-width: 360px; height: 12px; background: #e5e7eb; border-radius: 999px; overflow: hidden; box-shadow: inset 0 0 0 1px #f1f5f9; }
.bar-fill { height: 100%; border-radius: 999px; transition: width .3s ease; }
.controls button { padding: 8px 12px; border-radius: 8px; border: 1px solid #e6e8eb; background: #f3f5f7; cursor: pointer; margin-right: 8px; transition: transform .15s ease, box-shadow .15s ease, background .15s ease; }
.controls button:hover { background: #e5e7eb; }
.controls button:active { transform: scale(0.98); box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
/* .grid { display: none; } */
.settings-merge h4 { margin: 16px 0 0; font-size: 14px; color: #6b7280; }
.card { background: rgba(255,255,255,0.3); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.6); border-radius: 12px; padding: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.14); }
.todo-input { display: flex; gap: 14px; }
.todo-input input { flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; }
.todo-list { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.todo-list li { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border: 1px dashed #e5e7eb; border-radius: 8px; }
.todo-list li.done span { text-decoration: line-through; color: #6b7280; }
.todo-list .del { margin-left: auto; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; border-radius: 6px; padding: 6px 8px; }
textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
.calendar { display: flex; flex-direction: column; gap: 10px; }
.cal-head { display: flex; align-items: center; justify-content: space-between; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.cell { padding: 10px; text-align: center; border: 1px solid #e5e5e5; border-radius: 8px; cursor: pointer; user-select: none; }
.cell.pulse { animation: pulse .25s ease; }
.cell.out { opacity: 0.5; }
.cell.checked { background: #d1fae5; border-color: #34d399; }
.cell.head { font-weight: 700; background: #f3f4f6; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); color: #111827; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
.back-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); opacity: 0.95; }
.back-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(0,0,0,0.14); }
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
/* Fix diary textarea overflow */
textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; max-width: 100%; margin-top: 10px; }
.card { overflow: hidden; }
/* Dark mode text color support restored */
@media (prefers-color-scheme: dark) {
  .pomodoro { --text-color: #000; --sub-text-color: rgba(0,0,0,0.7); }
}
.pomodoro.dark-mode-active {
  --text-color: #000;
  --sub-text-color: rgba(0,0,0,0.7);
}
/* Force white text in light mode too, because background is dark blue now */
/* But user requested black text inside Pomodoro components specifically */
.pomodoro:not(.dark-mode-active) {
  --text-color: #000;
  --sub-text-color: rgba(0,0,0,0.7);
}

.back-btn { color: var(--text-color, #000); }
h2, h3, h4, .clock, .mode, label, .todo-list li span { color: var(--text-color, #000); }
.round, .settings-merge h4, .todo-list li.done span { color: var(--sub-text-color, rgba(0,0,0,0.7)); }

/* Input styling in dark mode */
.pomodoro.dark-mode-active input,
.pomodoro.dark-mode-active select,
.pomodoro.dark-mode-active textarea {
  background: rgba(255,255,255,0.15);
  color: #000;
  border-color: rgba(0,0,0,0.3);
}
.pomodoro.dark-mode-active input::placeholder,
.pomodoro.dark-mode-active textarea::placeholder {
  color: rgba(0,0,0,0.5);
}

/* Calendar Dark Mode */
.pomodoro.dark-mode-active .cell,
.pomodoro.dark-mode-active .cal-head button,
.pomodoro.dark-mode-active .cal-head span {
  color: #000;
  border-color: rgba(0,0,0,0.3);
}
.pomodoro.dark-mode-active .cell.head {
  background: rgba(255,255,255,0.1);
  color: #000;
}
.pomodoro.dark-mode-active .controls button,
.pomodoro.dark-mode-active .rows button {
  background: rgba(255,255,255,0.2);
  color: #000;
  border-color: rgba(0,0,0,0.3);
}
.pomodoro.dark-mode-active .controls button:hover,
.pomodoro.dark-mode-active .rows button:hover {
  background: rgba(255,255,255,0.3);
}

@media (prefers-color-scheme: dark) {
  .cell, .cal-head button, .cal-head span { color: #000; border-color: rgba(0,0,0,0.3); }
  .cell.head { background: rgba(255,255,255,0.1); color: #000; }
  .controls button, .rows button { background: rgba(255,255,255,0.2); color: #000; border-color: rgba(0,0,0,0.3); }
}
</style>
