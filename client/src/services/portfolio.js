import api from '../api'
export const getAlbums = () => api.get('/art/albums')
export const createAlbum = (payload) => api.post('/art/albums', payload)
export const getArtworks = (albumId) => api.get(`/art/albums/${albumId}/artworks`)
export const addArtwork = (albumId, payload) => api.post(`/art/albums/${albumId}/artworks`, payload)
export const getArtworkComments = (artworkId) => api.get(`/art/artworks/${artworkId}/comments`)
export const addArtworkComment = (artworkId, content) => api.post(`/art/artworks/${artworkId}/comments`, { content })
export const deleteAlbum = (albumId) => api.delete(`/art/albums/${albumId}`)
export const deleteArtwork = (artworkId) => api.delete(`/art/artworks/${artworkId}`)
