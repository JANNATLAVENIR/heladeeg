import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { backend } from '../lib/api'
import { demoMode, supabase, supabaseConfigured } from '../lib/supabase'
import {
  providers as initialProviders,
  reviews as initialReviews,
  initialRequests,
  complaints as initialComplaints,
  serviceCategories,
  neighborhoods,
} from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState({ id: 'guest', name: 'Martida', role: 'customer', isLoggedIn: false })
  const [providers, setProviders] = useState(() => supabaseConfigured ? [] : initialProviders)
  const [reviews, setReviews] = useState(() => supabaseConfigured ? [] : initialReviews)
  const [requests, setRequests] = useState(() => supabaseConfigured ? [] : initialRequests)
  const [complaints, setComplaints] = useState(() => supabaseConfigured ? [] : initialComplaints)
  const [categories, setCategories] = useState(() => supabaseConfigured ? [] : serviceCategories)
  const [notifications, setNotifications] = useState(() => supabaseConfigured ? [] : [
    { id: 'n1', user_id: 'c1', title: 'Codsigaaga waa la diray', body: 'Waxaad ka eegi kartaa xaaladda codsiga qaybta Codsiyadayda.', created_at: '2026-10-04 09:00', read_at: null },
    { id: 'n2', user_id: 'p1', title: 'Codsi adeeg oo cusub', body: 'Macmiil ayaa kuu soo diray codsi cusub oo koronto ah.', created_at: '2026-10-04 08:45', read_at: null },
    { id: 'n3', user_id: 'a1', title: 'Adeeg-bixiyeyaal sugaya hubin', body: 'Waxaa jira codsiyo xaqiijin u baahan in dib loo eego.', created_at: '2026-10-04 08:15', read_at: new Date().toISOString() },
  ])
  const [users, setUsers] = useState([])
  const [ownerSettings, setOwnerSettings] = useState({})
  const managedNeighborhoods = Array.isArray(ownerSettings.service_areas) && ownerSettings.service_areas.length ? ownerSettings.service_areas : neighborhoods
  const [auditLog, setAuditLog] = useState([])
  const [offlinePreview, setOfflinePreview] = useState(false)
  const [toast, setToast] = useState(null)
  const [backendReady, setBackendReady] = useState(!supabaseConfigured)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const login = useCallback(async (email, password) => {
    if (supabaseConfigured) {
      const session = await backend.signIn(email, password)
      if (email.trim().toLowerCase() === 'jannatlavenir@gmail.com') await backend.claimOwnerAccess(session.user.email)
      const profile = await backend.profile(session.user.id)
      setUser({ id: profile.id, name: profile.full_name, email: profile.email, phone: profile.phone, role: profile.role, isOwner: profile.email?.toLowerCase() === 'jannatlavenir@gmail.com', isLoggedIn: true })
      showToast(`Soo dhawoow, ${profile.full_name}!`)
      return profile
    }
    if (!demoMode) throw new Error('Marka hore Supabase geli faylka .env.local.')
    const role = email
    const name = password
    const profiles = {
      customer: { id: 'c1', name: name || 'Cali Maxamed', role: 'customer' },
      provider: { id: 'p1', name: name || 'Koronto-yaqaan', role: 'provider' },
      admin: { id: 'a1', name: name || 'Maamule', role: 'admin' },
    }
    const profile = profiles[role] || profiles.customer
    setUser({ ...profile, isLoggedIn: true })
    showToast(`Soo dhawoow, ${profile.name}!`, 'success')
  }, [showToast])

  const signUp = useCallback(async ({ name, email, phone, password }) => {
    if (supabaseConfigured) {
      const result = await backend.signUp({ name, email, phone, password })
      if (!result.session) return { pendingApproval: true, emailConfirmationRequired: true }
      if (email.trim().toLowerCase() === 'jannatlavenir@gmail.com') {
        await backend.claimOwnerAccess(result.user.email)
        const profile = await backend.profile(result.user.id)
        setUser({ id: profile.id, name: profile.full_name, email: profile.email, phone: profile.phone, role: profile.role, isOwner: true, isLoggedIn: true })
        return result
      }
      await supabase.auth.signOut()
      return { pendingApproval: true, emailConfirmationRequired: false }
    }
    if (!demoMode) throw new Error('Marka hore Supabase geli faylka .env.local.')
    const profile = { id: `c${Date.now()}`, name: name.trim(), email: email.trim(), phone: phone.trim(), role: 'customer' }
    setUser({ ...profile, isLoggedIn: true })
    showToast(`Akoonka tijaabada waa la sameeyey. Soo dhawoow, ${profile.name}!`)
  }, [showToast])

  const updateProfile = useCallback((changes) => {
    if (supabaseConfigured) return backend.updateProfile({ full_name: changes.name, phone: changes.phone }).then((profile) => { setUser((current) => ({ ...current, name: profile.full_name, phone: profile.phone })); showToast('Profile-ka waa la cusboonaysiiyey.') }).catch(e=>showToast(e.message,'error'))
    setUser((current) => ({ ...current, ...changes }))
    showToast('Xogta profile-ka waa la cusboonaysiiyey.')
  }, [showToast])

  const submitProviderApplication = useCallback((application) => {
    if (supabaseConfigured) return backend.submitProvider({ application, document: application.document_file || null }).then(async () => { const p=await backend.profile(user.id); const current={id:p.id,name:p.full_name,email:p.email,phone:p.phone,role:p.role,isLoggedIn:true}; setUser(current); await refreshBackend(current); showToast('Codsiga adeeg-bixiyaha waa la diray.') }).catch(e=>{showToast(e.message,'error'); throw e})
    const listings = application.categories.map((categoryId, index) => {
      const category = categories.find((item) => item.id === categoryId)
      return {
        id: `l-new-${index + 1}`,
        category_id: categoryId,
        title: category?.name_so || 'Adeeg cusub',
        description: application.bio,
        price_type: application.price_type,
        price_min: Number(application.price_min) || 0,
        price_max: Number(application.price_max) || 0,
      }
    })
    const profile = {
      id: 'p1', user_id: 'p1', full_name: application.full_name,
      display_name: application.full_name, bio: application.bio,
      phone: application.phone, email: application.email,
      service_area: application.service_areas,
      years_experience: Number(application.years_experience) || 0,
      verification_status: 'pending', verification_document_name: application.document_name,
      is_available: false, avatar: application.full_name.charAt(0).toUpperCase(),
      avatar_color: 'teal', rating: 0, review_count: 0, listings,
    }
    setProviders((prev) => prev.some((item) => item.id === 'p1')
      ? prev.map((item) => item.id === 'p1' ? { ...item, ...profile } : item)
      : [profile, ...prev])
    setUser({ id: 'p1', name: profile.display_name, role: 'provider', isLoggedIn: true })
    showToast('Codsiga adeeg-bixiyaha waa la diray. Wuxuu sugayaa dib-u-eegis maamulka.')
  }, [categories, showToast])

  const logout = useCallback(async () => {
    if (supabaseConfigured) await supabase.auth.signOut()
    setUser({ id: 'guest', name: 'Martida', role: 'customer', isLoggedIn: false })
    setRequests([]); setNotifications([]); setComplaints([]); setUsers([]); setAuditLog([])
    showToast('Waad baxday.', 'info')
  }, [showToast])

  const refreshBackend = useCallback(async (profile) => {
    try {
      const [cats, pros, revs] = await Promise.all([backend.categories(), backend.providers(profile), backend.reviews()])
      setCategories(cats)
      setProviders(pros)
      setReviews(revs)
      if (profile) {
        const [reqs, notes, reports, audit, userRows, settings] = await Promise.all([backend.requests(profile), backend.notifications(), profile.role === 'admin' ? backend.reports() : Promise.resolve([]), profile.role === 'admin' ? backend.auditLog() : Promise.resolve([]), profile.role === 'admin' ? backend.users() : Promise.resolve([]), backend.appSettings()])
        setRequests(reqs)
        setNotifications(notes)
        if (profile.role === 'admin') { setComplaints(reports); setAuditLog(audit); setUsers(userRows) }
        setOwnerSettings(settings)
      } else { setRequests([]); setNotifications([]); setComplaints([]); setUsers([]); setAuditLog([]); setOwnerSettings({}) }
    } catch (error) { showToast(error.message || 'Xogta Supabase lama soo qaadi karin.', 'error') }
    finally { setBackendReady(true) }
  }, [showToast])

  useEffect(() => {
    if (!supabaseConfigured) return
    let alive = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return
      if (data.session?.user) {
        try {
          if (data.session.user.email?.toLowerCase() === 'jannatlavenir@gmail.com') await backend.claimOwnerAccess(data.session.user.email)
          const p = await backend.profile(data.session.user.id)
          if (alive) { const current = { id:p.id,name:p.full_name,email:p.email,phone:p.phone,role:p.role,isOwner:p.email?.toLowerCase()==='jannatlavenir@gmail.com',isLoggedIn:true }; setUser(current); await refreshBackend(current) }
        } catch (error) { if (alive) { setBackendReady(true); showToast(error.message, 'error') } }
      } else await refreshBackend(null)
    }).catch(error=>{ if(alive){ setBackendReady(true); showToast(error.message || 'Supabase lama lala xiriiri karin.','error') } })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive || event === 'INITIAL_SESSION') return
      if (!session?.user) {
        setUser({ id:'guest',name:'Martida',role:'customer',isLoggedIn:false })
        setRequests([]); setNotifications([]); setComplaints([]); setUsers([]); setAuditLog([])
        refreshBackend(null)
        return
      }
      setBackendReady(false)
      window.setTimeout(async () => {
        try { if (session.user.email?.toLowerCase() === 'jannatlavenir@gmail.com') await backend.claimOwnerAccess(session.user.email); const p = await backend.profile(session.user.id); if (alive) { const current={id:p.id,name:p.full_name,email:p.email,phone:p.phone,role:p.role,isOwner:p.email?.toLowerCase()==='jannatlavenir@gmail.com',isLoggedIn:true}; setUser(current); await refreshBackend(current) } }
        catch (error) { if(alive){ setBackendReady(true); showToast(error.message,'error') } }
      },0)
    })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [refreshBackend, showToast])

  useEffect(() => {
    if (!supabaseConfigured || !user.isLoggedIn || user.role !== 'admin') return undefined
    const channel = supabase
      .channel(`admin-dashboard-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => {
        void backend.requests(user).then(setRequests).catch((error) => showToast(error.message, 'error'))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        void backend.users().then(setUsers).catch((error) => showToast(error.message, 'error'))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        Promise.all([backend.users(), backend.notifications()])
          .then(([userRows, notes]) => { setUsers(userRows); setNotifications(notes) })
          .catch((error) => showToast(error.message, 'error'))
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user.id, user.role, user.isLoggedIn, showToast])

  const submitRequest = useCallback((requestData) => {
    if (supabaseConfigured) return backend.createRequest(requestData).then(async (created) => { await refreshBackend(user); showToast('Codsiga waa la diray.'); return created }).catch((e) => { showToast(e.message, 'error'); return null })
    if (offlinePreview) { showToast('Internet ma jiro. Codsiga lama dirin.', 'error'); return null }
    const newReq = {
      id: `rq${Date.now()}`,
      customer_id: user.id,
      customer_name: user.name,
      created_at: new Date().toISOString(),
      status: 'new',
      ...requestData,
    }
    setRequests((prev) => [newReq, ...prev])
    setNotifications((prev) => [{ id: `n${Date.now()}`, user_id: requestData.provider_id || 'p1', title: 'Codsi adeeg oo cusub', body: `${user.name} ayaa kuu soo diray codsi ${requestData.category_name || 'adeeg'} ah.`, created_at: new Date().toLocaleString('so-SO'), read_at: null }, ...prev])
    showToast('Codsiga tijaabada waa la diray.')
    return newReq
  }, [user, offlinePreview, showToast])

  const updateRequestStatus = useCallback((requestId, newStatus) => {
    if (supabaseConfigured) {
      const request=requests.find(item=>item.id===requestId)
      const action=request?.provider_id ? backend.changeRequestStatus(requestId,newStatus) : newStatus==='accepted' ? backend.claimRequest(requestId) : backend.changeRequestStatus(requestId,newStatus)
      return action.then(async () => { await refreshBackend(user); showToast('Xaaladda codsiga waa la cusboonaysiiyey.'); return true }).catch((e) => { showToast(e.message, 'error'); return false })
    }
    if (offlinePreview) { showToast('Internet ma jiro. Xaaladda lama beddelin.', 'error'); return false }
    const allowed = {
      new: ['accepted', 'declined', 'cancelled'],
      accepted: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'disputed'],
      completed: ['disputed'],
      declined: [], cancelled: [], disputed: [],
    }
    const request = requests.find((item) => item.id === requestId)
    if (!request || !allowed[request.status]?.includes(newStatus)) {
      showToast('Xaaladdan codsiga looma beddeli karo.', 'error')
      return false
    }
    setRequests((prev) => prev.map((item) => item.id === requestId
      ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
      : item))
    const labels = {
      accepted: 'Codsiga waa la aqbalay', declined: 'Codsiga waa la diiday',
      in_progress: 'Shaqadu way bilaabatay', completed: 'Shaqadu way dhammaatay',
      cancelled: 'Codsiga waa la joojiyey', disputed: 'Codsiga waxaa loo gudbiyey cabasho',
    }
    showToast(labels[newStatus] || 'Xaaladda waa la cusboonaysiiyey.')
    setNotifications((prev) => [{ id: `n${Date.now()}`, user_id: request.customer_id, title: labels[newStatus] || 'Xaaladda codsiga waa la cusboonaysiiyey', body: `Codsiga ${request.id} wuxuu galay xaaladda ${newStatus}.`, created_at: new Date().toLocaleString('so-SO'), read_at: null }, ...prev])
    return true
  }, [requests, offlinePreview, showToast])

  const verifyProvider = useCallback((providerId, status, reason = '') => {
    if (supabaseConfigured) return backend.reviewProvider(providerId,status,reason).then(() => refreshBackend(user)).catch(e => showToast(e.message,'error'))
    if (offlinePreview) { showToast('Internet ma jiro. Go’aanka lama kaydin.', 'error'); return }
    setProviders((prev) => prev.map((provider) => provider.id === providerId
      ? { ...provider, verification_status: status, verification_reason: reason, verified_at: status === 'approved' ? new Date().toISOString() : null }
      : provider))
    setNotifications((prev) => [{ id: `n${Date.now()}`, user_id: providerId, title: status === 'approved' ? 'Xaqiijinta waa la ansixiyey' : 'Xaqiijinta waa la cusboonaysiiyey', body: reason || 'Ka eeg xaaladda profile-kaaga.', created_at: new Date().toLocaleString('so-SO'), read_at: null }, ...prev])
    setAuditLog((prev) => [{ id: `a${Date.now()}`, admin: user.name, action: status === 'approved' ? 'Ansixinta adeeg-bixiye' : 'Diidmada adeeg-bixiye', target: providerId, note: reason || 'Sabab laguma darin', created_at: new Date().toLocaleString('so-SO') }, ...prev])
    showToast(status === 'approved' ? 'Adeeg-bixiyaha waa la ansixiyey.' : 'Go’aanka xaqiijinta waa la diiwaangeliyey.', status === 'approved' ? 'success' : 'info')
  }, [offlinePreview, user.name, showToast])

  const upsertListing = useCallback((listing) => {
    if (supabaseConfigured) {
      const provider = providers.find(p => p.user_id === user.id)
      if (!provider) { showToast('Profile adeeg-bixiye lama helin.','error'); return }
      return backend.upsertListing(listing,provider.id).then(()=>refreshBackend(user)).catch(e=>showToast(e.message,'error'))
    }
    if (offlinePreview) { showToast('Internet ma jiro. Adeegga lama kaydin.', 'error'); return }
    const providerId = providers.find((provider) => provider.user_id === user.id || provider.id === user.id)?.id || 'p1'
    setProviders((prev) => prev.map((provider) => {
      if (provider.id !== providerId) return provider
      const listings = provider.listings || []
      const exists = listing.id && listings.some((item) => item.id === listing.id)
      const next = exists
        ? listings.map((item) => item.id === listing.id ? { ...item, ...listing } : item)
        : [...listings, { ...listing, id: `l${Date.now()}`, is_active: true }]
      return { ...provider, listings: next }
    }))
    showToast('Adeegga tijaabada waa la kaydiyey.')
  }, [providers, user, offlinePreview, showToast])

  const removeListing = useCallback((listingId) => {
    if (supabaseConfigured) return backend.deleteListing(listingId).then(()=>refreshBackend(user)).catch(e=>showToast(e.message,'error'))
    if (offlinePreview) { showToast('Internet ma jiro. Adeegga lama beddelin.', 'error'); return }
    setProviders((prev) => prev.map((provider) => ({ ...provider, listings: (provider.listings || []).filter((item) => item.id !== listingId) })))
    showToast('Adeegga tijaabada waa laga saaray.')
  }, [offlinePreview, showToast])

  const updateProviderAvailability = useCallback((available) => {
    if (supabaseConfigured) {
      const provider=providers.find(p=>p.user_id===user.id)
      if (!provider) return showToast('Profile adeeg-bixiye lama helin.','error')
      return backend.setAvailability(provider.id,available).then(()=>refreshBackend(user)).catch(e=>showToast(e.message,'error'))
    }
    if (offlinePreview) { showToast('Internet ma jiro. Xaaladda helitaanka lama beddelin.', 'error'); return }
    const providerId = providers.find((provider) => provider.user_id === user.id || provider.id === user.id)?.id || 'p1'
    setProviders((prev) => prev.map((provider) => provider.id === providerId ? { ...provider, is_available: available } : provider))
    showToast(available ? 'Waxaad hadda muujisay inaad diyaar tahay.' : 'Xaaladdaada diyaar ahaanshaha waa la damiyey.')
  }, [providers, user, offlinePreview, showToast])

  const addReview = useCallback((review) => {
    if (supabaseConfigured) return backend.addReview(review).then(async () => { await refreshBackend(user); showToast('Qiimeynta waa la diray.') }).catch(e => { showToast(e.message,'error'); throw e })
    if (offlinePreview) { showToast('Internet ma jiro. Qiimeynta lama dirin.', 'error'); return }
    setReviews((prev) => [{
      ...review, id: `r${Date.now()}`, customer_id: user.id,
      customer_name: user.name, created_at: new Date().toISOString().slice(0, 10),
    }, ...prev])
    showToast('Qiimeynta tijaabada waa la diray.')
  }, [user, offlinePreview, showToast])

  const addReport = useCallback((report) => {
    if (supabaseConfigured) return backend.addReport({ request_id: report.request_id || null, target_type: report.target_type || 'general', target_id: report.target_id || null, reason: report.reason || report.subject, details: report.details, reporter_id: user.id }).then(async () => { if(user.role==='admin') await refreshBackend(user); showToast('Warbixinta waa la gudbiyey.') }).catch(e => { showToast(e.message,'error'); throw e })
    if (offlinePreview) { showToast('Internet ma jiro. Warbixinta lama gudbin.', 'error'); return }
    setComplaints((prev) => [{
      ...report, id: `cp${Date.now()}`, requester: user.name,
      status: 'open', created_at: new Date().toISOString().slice(0, 10),
    }, ...prev])
    showToast('Warbixinta tijaabada waa la gudbiyey.')
  }, [user, offlinePreview, showToast])

  const resolveReport = useCallback((reportId, resolutionNote) => {
    if (supabaseConfigured) return backend.resolveReport(reportId,resolutionNote).then(async () => { await refreshBackend(user); showToast('Cabashada waa la xalliyey.') }).catch(e => showToast(e.message,'error'))
    if (offlinePreview) { showToast('Internet ma jiro. Xallinta lama kaydin.', 'error'); return }
    setComplaints((prev) => prev.map((item) => item.id === reportId
      ? { ...item, status: 'resolved', resolution_note: resolutionNote }
      : item))
    setAuditLog((prev) => [{ id: `a${Date.now()}`, admin: user.name, action: 'Xallinta cabasho', target: reportId, note: resolutionNote, created_at: new Date().toLocaleString('so-SO') }, ...prev])
    showToast('Cabashada tijaabada waa la xalliyey.')
  }, [offlinePreview, user.name, showToast])

  const upsertCategory = useCallback((category) => {
    if (supabaseConfigured) return backend.upsertCategory(category).then(()=>refreshBackend(user)).catch(e=>{showToast(e.message,'error');throw e})
    if (offlinePreview) { showToast('Internet ma jiro. Qaybta lama kaydin.', 'error'); return }
    setCategories((prev) => category.id && prev.some((item) => item.id === category.id)
      ? prev.map((item) => item.id === category.id ? { ...item, ...category } : item)
      : [...prev, { ...category, id: category.id || category.slug || `category-${Date.now()}`, sort_order: prev.length + 1, is_active: true }])
    setAuditLog((prev) => [{ id: `a${Date.now()}`, admin: user.name, action: 'Wax ka beddel qayb', target: category.slug || category.id || category.name_so, note: category.name_so, created_at: new Date().toLocaleString('so-SO') }, ...prev])
    showToast('Qaybta tijaabada waa la kaydiyey.')
  }, [offlinePreview, user.name, showToast])

  const markNotificationRead = useCallback((notificationId) => {
    if (supabaseConfigured) { backend.markRead(notificationId).then(() => refreshBackend(user)).catch(e=>showToast(e.message,'error')); return }
    setNotifications((prev) => prev.map((item) => item.id === notificationId
      ? { ...item, read_at: new Date().toISOString() }
      : item))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    if (supabaseConfigured) { Promise.all(notifications.filter(n=>!n.read_at).map(n=>backend.markRead(n.id))).then(()=>refreshBackend(user)).catch(e=>showToast(e.message,'error')); return }
    setNotifications((prev) => prev.map((item) => item.user_id === user.id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item))
  }, [user.id])

  const saveOwnerSettings = useCallback(async (values) => {
    try {
      await backend.saveAppSettings(values)
      setOwnerSettings(current => ({ ...current, ...values }))
      showToast('Dejimaha app-ka waa la kaydiyey.')
    } catch (error) { showToast(error.message || 'Dejimaha lama kaydin.', 'error'); throw error }
  }, [showToast])

  const refreshUsers = useCallback(async () => { setUsers(await backend.users()) }, [])
  const setUserSuspension = useCallback(async (id, suspended, reason = '') => {
    try {
      await backend.setUserSuspension(id, suspended, reason)
      await refreshUsers()
      showToast(suspended ? 'Akoonka waa la joojiyey.' : 'Akoonka dib ayaa loo hawlgeliyey.')
    } catch (error) { showToast(error.message || 'Xaaladda akoonka lama beddelin.', 'error'); throw error }
  }, [refreshUsers, showToast])
  const setUserApproval = useCallback(async (id, status) => {
    try {
      await backend.setUserApproval(id, status)
      await refreshUsers()
      showToast(status === 'approved' ? 'Akoonka waa la ansixiyey.' : 'Akoonka waa la diiday.')
    } catch (error) { showToast(error.message || 'Xaaladda ansixinta lama beddelin.', 'error'); throw error }
  }, [refreshUsers, showToast])

  const getProviderById = useCallback((id) => providers.find((provider) => provider.id === id), [providers])
  const getCategoryById = useCallback((id) => categories.find((category) => category.id === id), [categories])
  const getReviewsForProvider = useCallback((providerId) => reviews.filter((review) => review.provider_id === providerId), [reviews])
  const getUserRequests = useCallback((userId, role) => role === 'provider'
    ? requests.filter((request) => request.provider_id === userId)
    : requests.filter((request) => request.customer_id === userId), [requests])

  const getProviderDocumentUrl = useCallback((path) => backend.providerDocumentUrl(path), [])
  const refreshDashboard = useCallback(() => refreshBackend(user), [refreshBackend, user])

  const value = {
    user, login, signUp, logout, updateProfile, submitProviderApplication,
    providers, reviews, requests, complaints, notifications, users, refreshDashboard,
    auditLog, getProviderDocumentUrl, ownerSettings, saveOwnerSettings, refreshUsers, setUserSuspension, setUserApproval,
    serviceCategories: categories.filter((category) => category.is_active !== false),
    allCategories: categories, neighborhoods: managedNeighborhoods,
    submitRequest, updateRequestStatus, verifyProvider,
    upsertListing, removeListing, updateProviderAvailability, addReview, addReport, resolveReport, upsertCategory,
    markNotificationRead, markAllNotificationsRead,
    offlinePreview, setOfflinePreview, backendReady, backendConfigured: supabaseConfigured,
    getProviderById, getCategoryById, getReviewsForProvider, getUserRequests,
    toast, showToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
