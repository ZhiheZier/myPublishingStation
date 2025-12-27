<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <div class="grid grid-cols-3 items-center mb-4">
      <div class="text-left">
        <button class="back-btn" @click="$router.back()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          返回上一页
        </button>
      </div>
      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-900">{{ albumTitle }}</h2>
      </div>
      <div></div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
      <div class="tile-wrap" @click="showAdd = true">
        <div class="tile" :style="{ '--tile-ratio': tileRatio }">
          <div class="tile-inner">
            <div class="circle">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12M6 12h12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div v-for="art in artworks" :key="art.id" class="tile-wrap" @click="openViewer(art)">
        <div class="tile" :style="{ '--tile-ratio': tileRatio }">
          <div class="tile-inner">
            <img :src="art.image_url" class="cover" />
          </div>
          <button class="tile-del" title="删除画作" @click.stop="onDeleteArtwork(art.id)">×</button>
        </div>
        <div class="tile-caption">{{ art.title }}</div>
      </div>
    </div>

    <div v-if="showAdd" class="modal">
      <div class="modal-content">
        <h4 class="font-semibold mb-3">添加画作</h4>
        <input v-model.trim="artForm.title" class="input" placeholder="标题" />
        <input v-model.trim="artForm.imageUrl" class="input" placeholder="图片链接（或上传）" />
        <input type="file" @change="onFile" />
        <div>
          <div class="chips">
            <span v-for="(t,i) in artTags" :key="i" class="chip">
              {{ t }} <button class="chip-close" @click="removeArtTag(i)">×</button>
            </span>
          </div>
          <input v-model.trim="tagInput" class="input" placeholder="添加标签，回车确认" @keydown.enter.prevent="addArtTag" />
        </div>
        <div class="flex gap-2 mt-2">
          <button class="btn" @click="saveArtwork" :disabled="saving">保存</button>
          <button class="btn-secondary" @click="cancelAdd">取消</button>
        </div>
        <p class="text-sm text-red-600" v-if="artError">{{ artError }}</p>
      </div>
    </div>

    <div v-if="viewer.open" class="modal">
      <div class="viewer">
        <img :src="viewer.art?.image_url" class="viewer-image" />
        <div class="viewer-side">
          <h4 class="font-semibold mb-2">{{ viewer.art?.title }}</h4>
          <div class="chips mb-2">
            <span v-for="t in viewer.art?.tags || []" :key="t.id" class="chip">{{ t.name }}</span>
          </div>
          <div class="comments">
            <h5 class="font-semibold mb-1">评论</h5>
            <ul class="space-y-2 max-h-64 overflow-auto">
              <li v-for="c in comments" :key="c.id" class="bg-white/70 rounded p-2">
                <div class="text-sm text-gray-800">{{ c.username || '匿名' }} · {{ formatDate(c.created_at) }}</div>
                <div class="text-sm text-gray-900">{{ c.content }}</div>
              </li>
            </ul>
            <div v-if="isLogged" class="mt-2">
              <textarea v-model.trim="newComment" class="input" placeholder="写下评论..."></textarea>
              <button class="btn" @click="submitComment" :disabled="savingComment || !newComment">提交</button>
            </div>
          </div>
          <button class="btn-secondary mt-3" @click="closeViewer">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getArtworks, addArtwork, getAlbums, getArtworkComments, addArtworkComment } from '../services/portfolio'
import { useAuthStore } from '../stores/auth'
export default {
  name: 'Album',
  data() {
    return {
      artworks: [],
      albumTitle: '',
      showAdd: false,
      saving: false,
      artForm: { title: '', imageUrl: '', base64Data: '' },
      artTags: [],
      tagInput: '',
      artError: '',
      viewer: { open: false, art: null },
      comments: [],
      newComment: '',
      savingComment: false,
      tileRatio: '1 / 1'
    }
  },
  computed: {
    albumId() { return this.$route.params.id },
    isLogged() { return !!useAuthStore().user }
  },
  methods: {
    async loadAlbum() {
      const resA = await getAlbums()
      const found = Array.isArray(resA.data) ? resA.data.find(a => String(a.id) === String(this.albumId)) : null
      this.albumTitle = found?.title || ''
      await this.loadArtworks()
    },
    async loadArtworks() {
      const res = await getArtworks(this.albumId)
      this.artworks = res.data
    },
    onFile(e) {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      const reader = new FileReader()
      reader.onload = () => { this.artForm.base64Data = reader.result }
      reader.readAsDataURL(f)
    },
    addArtTag() {
      const v = this.tagInput.trim()
      if (!v) return
      this.artTags.push(v)
      this.tagInput = ''
    },
    removeArtTag(i) {
      this.artTags.splice(i, 1)
    },
    async saveArtwork() {
      this.artError = ''
      if (!this.artForm.title || (!this.artForm.imageUrl && !this.artForm.base64Data)) {
        this.artError = '请提供标题与图片'
        return
      }
      this.saving = true
      try {
        await addArtwork(this.albumId, { title: this.artForm.title, imageUrl: this.artForm.imageUrl, base64Data: this.artForm.base64Data, tags: this.artTags })
        this.artForm = { title: '', imageUrl: '', base64Data: '' }
        this.artTags = []
        this.tagInput = ''
        this.showAdd = false
        await this.loadArtworks()
      } finally {
        this.saving = false
      }
    },
    cancelAdd() {
      this.showAdd = false
      this.artForm = { title: '', imageUrl: '', base64Data: '' }
      this.artTags = []
      this.tagInput = ''
    },
    async onDeleteArtwork(id) {
      if (!confirm('确认删除该画作？')) return
      try {
        await (await import('../services/portfolio')).deleteArtwork(id)
        await this.loadArtworks()
      } catch (e) {
        alert('删除失败')
      }
    },
    async openViewer(art) {
      this.viewer.open = true
      this.viewer.art = art
      await this.loadComments(art.id)
    },
    closeViewer() {
      this.viewer.open = false
      this.viewer.art = null
      this.comments = []
      this.newComment = ''
    },
    async loadComments(artworkId) {
      const res = await getArtworkComments(artworkId)
      this.comments = res.data || []
    },
    async submitComment() {
      if (!this.viewer.art || !this.newComment) return
      this.savingComment = true
      try {
        await addArtworkComment(this.viewer.art.id, this.newComment)
        this.newComment = ''
        await this.loadComments(this.viewer.art.id)
      } finally {
        this.savingComment = false
      }
    },
    formatDate(s) {
      return new Date(s).toLocaleString()
    }
  },
  mounted() {
    this.loadAlbum()
  }
}
</script>
<style scoped>
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); color: #111827; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
.back-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); opacity: 0.95; }
.back-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(0,0,0,0.14); }
@media (prefers-color-scheme: dark) {
  .back-btn { color: #fff; }
}
.input { width: 100%; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.85); }
.btn { padding: 8px 12px; background: #ef4444; color: #fff; border: none; border-radius: 8px; }
.btn-secondary { padding: 8px 12px; background: #e5e7eb; color: #111827; border: none; border-radius: 8px; }
.tile { aspect-ratio: var(--tile-ratio, 1 / 1); border: 2px dashed rgba(255,255,255,0.5); border-radius: 16px; cursor: pointer; position: relative; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px) saturate(120%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.12); perspective: 800px; transform-style: preserve-3d; transition: box-shadow .25s ease, background .25s ease, border-color .25s ease; }
/* removed explicit tile width/height to restore original sizing */
.tile:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.18); box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 16px 36px rgba(0,0,0,0.16); }
.tile-inner { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: transform .25s ease, box-shadow .25s ease; transform: translateZ(0); }
.tile:hover .tile-inner { transform: translateZ(14px) rotateX(1.6deg) rotateY(1.6deg); box-shadow: 0 12px 24px rgba(0,0,0,0.18); }
.circle { width: 56px; height: 56px; border-radius: 9999px; background: linear-gradient(135deg, rgba(0,0,0,0.65), rgba(0,0,0,0.45)); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }
.cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 14px; opacity: 0.9; }
.tile-wrap { display: flex; flex-direction: column; gap: 6px; }
.tile-caption { text-align: center; font-weight: 600; color: #111827; text-shadow: 0 1px 2px rgba(255,255,255,0.6); }
.tile-del { position: absolute; right: 8px; top: 8px; width: 22px; height: 22px; border-radius: 9999px; background: rgba(0,0,0,0.6); color: #fff; border: none; cursor: pointer; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-content { width: min(520px, 92vw); background: rgba(255,255,255,0.9); border-radius: 12px; padding: 16px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 9999px; background: rgba(239,68,68,0.15); color: #ef4444; }
.chip-close { background: transparent; border: none; color: #ef4444; cursor: pointer; }
.viewer { width: min(1100px, 95vw); background: rgba(255,255,255,0.95); border-radius: 12px; padding: 16px; display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
.viewer-image { width: 100%; height: 70vh; object-fit: contain; background: #111827; border-radius: 8px; }
.viewer-side { display: flex; flex-direction: column; }
/* Dark mode text color support restored */
.tile-caption { text-align: center; font-weight: 600; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
.text-gray-900 { color: #fff !important; }

@media (prefers-color-scheme: dark) {
  .tile-caption { color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
  .text-gray-900 { color: #fff !important; }
}
:global(.dark-mode) .tile-caption { color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
:global(.dark-mode) .text-gray-900 { color: #fff !important; }
</style>
