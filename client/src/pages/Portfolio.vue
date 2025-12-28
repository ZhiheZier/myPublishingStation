<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <div class="space-y-6">
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
          <h3 class="text-lg font-semibold text-gray-900">我的作品集</h3>
        </div>
        <div></div>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2"></h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="tile-wrap" @click="showCreate = true">
            <div class="tile" :style="{ '--tile-ratio': tileRatio }">
              <div class="tile-inner">
                <div class="circle">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12M6 12h12"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div v-for="a in albums" :key="a.id" class="tile-wrap" @click="$router.push({ name: 'Album', params: { id: a.id } })">
            <div class="tile" :style="{ '--tile-ratio': tileRatio }">
              <div class="tile-inner">
                <img v-if="a.cover_url" :src="a.cover_url" class="cover"/>
                <div v-else class="circle">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12M6 12h12"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="tile-caption">{{ a.title }}</div>
          </div>
        </div>
      </div>

      <!-- Create Album Modal -->
      <div v-if="showCreate" class="modal">
        <div class="modal-content">
          <h4 class="font-semibold mb-3" style="color: #111827;">创建画集</h4>
          <input v-model.trim="albumForm.title" class="input" placeholder="画集名称" />
          <input v-model.trim="albumForm.description" class="input" placeholder="简介（可选）" />
          <!-- removed album tags UI -->
          <div class="flex gap-2 mt-2">
            <button class="btn" @click="createAlbum" :disabled="creatingAlbum || !albumForm.title">创建</button>
            <button class="btn-secondary" @click="cancelCreate">取消</button>
          </div>
          <p class="text-sm text-red-600" v-if="createError">{{ createError }}</p>
        </div>
      </div>

      <!-- No inline artworks section; album opens in its own page -->
    </div>
  </div>
</template>
<script>
import { getAlbums, createAlbum as apiCreateAlbum } from '../services/portfolio'
import { useAuthStore } from '../stores/auth'
export default {
  name: 'Portfolio',
  data() {
    return {
      albums: [],
      selectedAlbumId: null,
      creatingAlbum: false,
      showAdd: false,
      showCreate: false,
      artError: '',
      createError: '',
      albumForm: { title: '', description: '' },
      artForm: { title: '', imageUrl: '', base64Data: '', tags: '' },
      tileRatio: '2 / 3'
    }
  },
  computed: {
    isLogged() { return !!useAuthStore().user }
  },
  methods: {
    async loadAlbums() {
      const res = await getAlbums()
      this.albums = res.data
    },
    async createAlbum() {
      if (!this.albumForm.title) {
        this.albumForm.title = this.computeDefaultAlbumTitle()
      }
      this.creatingAlbum = true
      try {
        this.createError = ''
        if (!this.isLogged) {
          this.createError = '请先登录后再创建画集'
          this.$router.push({ name: 'Login' })
          return
        }
        const res = await apiCreateAlbum({ title: this.albumForm.title, description: this.albumForm.description })
        const newId = res.data?.id
        this.albumForm = { title: '', description: '' }
        this.showCreate = false
        if (newId) {
          this.$router.push({ name: 'Album', params: { id: newId } })
        } else {
          await this.loadAlbums()
        }
      } catch (e) {
        this.createError = e?.response?.data?.error || '创建失败'
      } finally {
        this.creatingAlbum = false
      }
    },
    computeDefaultAlbumTitle() {
      const pattern = /^未命名(\d+)$/
      let max = 0
      this.albums.forEach(a => {
        const m = a.title && a.title.trim().match(pattern)
        if (m) {
          const n = parseInt(m[1], 10)
          if (!isNaN(n) && n > max) max = n
        }
      })
      return `未命名${max + 1}`
    },
    cancelCreate() {
      this.showCreate = false
      this.albumForm = { title: '', description: '' }
    }
  },
  mounted() {
    this.loadAlbums()
  }
}
</script>
<style scoped>
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); color: #111827; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
.back-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); opacity: 0.95; }
.back-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(0,0,0,0.14); }
.input { width: 100%; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.85); color: #111827; }
.input::placeholder { color: rgba(17, 24, 39, 0.5); }
.btn { padding: 8px 12px; background: #ef4444; color: #fff; border: none; border-radius: 8px; }
.btn-secondary { padding: 8px 12px; background: #e5e7eb; color: #111827; border: none; border-radius: 8px; }
.tile { aspect-ratio: var(--tile-ratio, 1 / 1); border: 2px dashed rgba(255,255,255,0.5); border-radius: 16px; cursor: pointer; position: relative; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px) saturate(120%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.12); perspective: 800px; transform-style: preserve-3d; transition: box-shadow .25s ease, background .25s ease, border-color .25s ease; }
/* removed explicit tile width/height to restore original sizing */
.tile:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.18); box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 16px 36px rgba(0,0,0,0.16); }
.tile-inner { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: transform .25s ease, box-shadow .25s ease; transform: translateZ(0); }
.tile:hover .tile-inner { transform: translateZ(14px) rotateX(1.6deg) rotateY(1.6deg); box-shadow: 0 12px 24px rgba(0,0,0,0.18); }
.circle { width: 56px; height: 56px; border-radius: 9999px; background: linear-gradient(135deg, rgba(0,0,0,0.65), rgba(0,0,0,0.45)); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }
.circle { pointer-events: none; }
.cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 14px; opacity: 0.9; }
.tile-tags { position: absolute; top: 10px; left: 12px; right: 12px; font-size: 12px; color: #374151; }
.tile-wrap { display: flex; flex-direction: column; gap: 6px; }
.tile-caption { text-align: center; font-weight: 600; color: #111827 !important; text-shadow: 0 1px 2px rgba(255,255,255,0.6); }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-content { width: min(520px, 92vw); background: rgba(255,255,255,0.9); border-radius: 12px; padding: 16px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 9999px; background: rgba(239,68,68,0.15); color: #ef4444; }
.chip-close { background: transparent; border: none; color: #ef4444; cursor: pointer; }
/* Force black text for portfolio */
.tile-caption { color: #111827 !important; }
.text-gray-900 { color: #111827 !important; }
</style>
