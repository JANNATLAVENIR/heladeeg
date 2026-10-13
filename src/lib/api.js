import { requireSupabase } from './supabase'

const s = () => requireSupabase()

export const backend = {
  async signIn(email, password) {
    const { data, error } = await s().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },
  async requestPasswordReset(email) {
    const { error } = await s().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    if (error) throw error
  },
  async updatePassword(password) {
    const { data, error } = await s().auth.updateUser({ password })
    if (error) throw error
    return data
  },
  async signUp({ name, email, phone, password }) {
    const { data, error } = await s().auth.signUp({ email, password, options: { data: { full_name: name.trim(), phone: phone?.trim() || null } } })
    if (error) throw error
    return data
  },
  async profile(userId) {
    const { data: approvalStatus, error: approvalError } = await s().rpc('account_approval_status')
    if (approvalError) throw approvalError
    if (approvalStatus !== 'approved') {
      await s().auth.signOut()
      const error = new Error(approvalStatus === 'rejected' ? 'Akoonka lama ansixin. La xiriir taageerada app-ka.' : 'Akoonkaagu wuxuu sugayaa ansixinta admin-ka.')
      error.code = approvalStatus === 'rejected' ? 'ACCOUNT_REJECTED' : 'ACCOUNT_PENDING'
      throw error
    }
    const { data: suspended, error: suspensionError } = await s().rpc('is_account_suspended')
    if (suspensionError) throw suspensionError
    if (suspended) {
      await s().auth.signOut()
      throw new Error('Akoonka waa la joojiyey. La xiriir taageerada app-ka.')
    }
    const { data, error } = await s().from('profiles').select('*').eq('id', userId).single()
    if (error) throw error
    return data
  },
  async claimOwnerAccess(email) {
    if (email?.toLowerCase() !== 'jannatlavenir@gmail.com') return false
    const { data, error } = await s().rpc('claim_app_owner')
    if (error) throw error
    return data
  },
  async appSettings() {
    const { data, error } = await s().from('app_settings').select('key,value')
    if (error) throw error
    return Object.fromEntries((data || []).map(row => [row.key, row.value]))
  },
  async saveAppSettings(values) {
    const { error } = await s().rpc('owner_save_app_settings', { p_values: values })
    if (error) throw error
  },
  async changeUserRole(userId, role) {
    const { error } = await s().rpc('owner_change_user_role', { p_user_id: userId, p_role: role })
    if (error) throw error
  },
  async setUserSuspension(userId, suspended, reason = '') {
    const { error } = await s().rpc('owner_set_user_suspension', { p_user_id: userId, p_suspend: suspended, p_reason: reason || null })
    if (error) throw error
  },
  async setUserApproval(userId, status) {
    const { error } = await s().rpc('owner_set_user_approval', { p_user_id: userId, p_status: status })
    if (error) throw error
  },
  async updateProfile(changes) {
    const { data, error } = await s().from('profiles').update({ full_name: changes.full_name, phone: changes.phone, updated_at: new Date().toISOString() }).select().single()
    if (error) throw error
    return data
  },
  async categories() {
    const { data, error } = await s().from('service_categories').select('*').order('sort_order')
    if (error) throw error
    return data
  },
  async providers(user) {
    let query = s().from('providers').select('*, service_listings(*)')
    if (user?.role === 'admin') query = s().from('providers').select('*, service_listings(*), provider_documents(file_name,storage_path), profiles:profiles!providers_user_id_fkey(full_name)').eq('is_demo', false)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data.map(p => ({ ...p, name: p.profiles?.full_name || p.display_name, avatar: p.display_name?.trim()?.charAt(0)?.toUpperCase() || '?', avatar_color: 'slate', is_demo: Boolean(p.is_demo), verification_document_name: p.provider_documents?.[0]?.file_name, verification_document_path: p.provider_documents?.[0]?.storage_path, listings: p.service_listings || [] }))
  },
  async requests(user) {
    let query = s().from('service_requests').select('*, service_categories(name_so), providers(display_name), profiles:profiles!service_requests_customer_id_fkey(full_name)')
    if (user.role === 'customer') query = query.eq('customer_id', user.id)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data.map(r => ({ ...r, customer_name:r.profiles?.full_name, category_name: r.service_categories?.name_so, provider_name: r.providers?.display_name }))
  },
  async notifications() {
    const { data, error } = await s().from('notifications').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async reviews() {
    const { data, error } = await s().from('reviews').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data.map(r=>({...r,customer_name:'Macmiil'}))
  },
  async reports() {
    const { data, error } = await s().from('reports').select('*, profiles:profiles!reports_reporter_id_fkey(full_name)').order('created_at', { ascending: false })
    if (error) throw error
    return data.map(r=>({...r,requester:r.profiles?.full_name,subject:r.reason}))
  },
  async auditLog() {
    const { data, error } = await s().from('admin_audit_log').select('*, profiles:profiles!admin_audit_log_admin_id_fkey(full_name)').order('created_at', { ascending: false })
    if (error) throw error
    return data.map(item=>({...item,admin:item.profiles?.full_name || item.admin_id,target:[item.target_type,item.target_id].filter(Boolean).join(':')}))
  },
  async users() {
    const { data, error } = await s().from('profiles').select('id,full_name,email,phone,role,approval_status,created_at,suspended_at,suspension_reason,providers(verification_status)').order('created_at',{ascending:false})
    if (error) throw error
    return data.map(item=>({...item,provider_status:item.providers?.[0]?.verification_status || null}))
  },
  async providerDocumentUrl(path) {
    const { data, error } = await s().storage.from('provider-documents').createSignedUrl(path, 60)
    if (error) throw error
    return data.signedUrl
  },
  async upsertListing(listing, providerId) {
    const payload = { ...listing, provider_id: providerId, price_min: listing.price_min === '' ? null : Number(listing.price_min), price_max: listing.price_max === '' ? null : Number(listing.price_max) }
    const { error } = listing.id
      ? await s().from('service_listings').update(payload).eq('id', listing.id)
      : await s().from('service_listings').insert(payload)
    if (error) throw error
  },
  async setAvailability(providerId, value) {
    const { error } = await s().from('providers').update({ is_available: value }).eq('id', providerId)
    if (error) throw error
  },
  async upsertCategory(category) {
    const isUpdate = Boolean(category.id && /^[0-9a-f-]{36}$/i.test(category.id))
    const payload = { ...category, slug: category.slug || (isUpdate ? category.name_en?.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') : category.id), sort_order: Number(category.sort_order) || 0 }
    if (!isUpdate) delete payload.id
    const { error } = isUpdate
      ? await s().from('service_categories').update(payload).eq('id', category.id)
      : await s().from('service_categories').insert(payload)
    if (error) throw error
  },
  async deleteListing(id) {
    const { error } = await s().from('service_listings').delete().eq('id', id)
    if (error) throw error
  },
  async createRequest(request) {
    const photo_path = request.photo_file ? await this.uploadRequestPhoto(request.photo_file) : request.photo_path || null
    const { data, error } = await s().rpc('create_service_request', {
      p_provider_id: request.provider_id || null, p_listing_id: request.listing_id || null,
      p_category_id: request.category_id, p_description: request.description,
      p_neighborhood: request.neighborhood, p_preferred_time: request.preferred_time,
      p_photo_path: photo_path,
    })
    if (error) throw error
    return { id: data }
  },
  async changeRequestStatus(id, status, note) {
    const { error } = await s().rpc('change_request_status', { p_request_id: id, p_status: status, p_note: note || null })
    if (error) throw error
  },
  async claimRequest(id) {
    const { error } = await s().rpc('claim_service_request', { p_request_id: id })
    if (error) throw error
  },
  async submitProvider({ application, document }) {
    let path = null
    if (document) {
      const ext = document.name.split('.').pop().toLowerCase()
      path = `${(await s().auth.getUser()).data.user.id}/${crypto.randomUUID()}.${ext}`
      const { error } = await s().storage.from('provider-documents').upload(path, document, { upsert: false, contentType: document.type })
      if (error) throw error
    }
    const { data, error } = await s().rpc('create_provider_application', {
      p_display_name: application.full_name, p_bio: application.bio, p_phone: application.phone,
      p_years: Number(application.years_experience) || 0, p_areas: application.service_areas || [],
      p_category_ids: application.categories || [], p_price_type: application.price_type || 'quote',
      p_price_min: application.price_min ? Number(application.price_min) : null,
      p_price_max: application.price_max ? Number(application.price_max) : null,
      p_document_path: path, p_document_name: document?.name || '', p_document_type: document?.type || '',
    })
    if (error) throw error
    return data
  },
  async reviewProvider(id, status, reason) {
    const { error } = await s().rpc('review_provider', { p_provider_id: id, p_status: status, p_reason: reason || null })
    if (error) throw error
  },
  async addReview(review) {
    const { data } = await s().auth.getUser()
    const { error } = await s().from('reviews').insert({ ...review, customer_id: data.user.id })
    if (error) throw error
  },
  async addReport(report) {
    const { error } = await s().from('reports').insert(report)
    if (error) throw error
  },
  async resolveReport(id, note) {
    const { error } = await s().rpc('resolve_report', { p_report_id: id, p_note: note })
    if (error) throw error
  },
  async markRead(id) {
    const { error } = await s().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  },
  async uploadRequestPhoto(file) {
    const uid = (await s().auth.getUser()).data.user.id
    const path = `${uid}/${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`
    const { error } = await s().storage.from('request-photos').upload(path, file, { contentType: file.type })
    if (error) throw error
    return path
  },
}
