import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Clock, Eye, ArrowRight, Tag, Rss, TrendingUp } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import SEOHead from '@/components/shared/SEOHead'
import { blogAPI } from '@/api/blog'

// Colour map for category badges
const COLOUR_MAP = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  amber:  'bg-amber-100 text-amber-700',
  teal:   'bg-teal-100 text-teal-700',
  rose:   'bg-rose-100 text-rose-700',
}

function CategoryBadge({ category, className = '' }) {
  if (!category) return null
  const colour = COLOUR_MAP[category.color] || 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colour} ${className}`}>
      {category.name}
    </span>
  )
}

function PostCard({ post, featured = false }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  if (featured) {
    return (
      <Link to={`/blog/${post.slug}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
        {/* Cover image placeholder or image */}
        <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50 to-purple-50 flex items-center justify-center">
          {post.cover_image_url ? (
            <img src={post.cover_image_url} alt={post.cover_image_alt || post.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-primary/40">
              <Rss className="h-12 w-12" />
            </div>
          )}
          {post.is_featured && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              Featured
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <CategoryBadge category={post.category} className="mb-2 w-fit" />
          <h2 className="mb-2 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{date}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time_minutes} min</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/blog/${post.slug}`} className="group flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex-1 min-w-0">
        <CategoryBadge category={post.category} className="mb-1.5" />
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{post.excerpt}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span>{date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time_minutes} min read</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count}</span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const activeCategory = searchParams.get('category') || ''

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeCategory) params.category = activeCategory
      if (search) params.search = search

      const [postsRes, catsRes] = await Promise.all([
        blogAPI.getPosts(params),
        blogAPI.getCategories(),
      ])
      const results = postsRes.data.results || postsRes.data || []
      setPosts(results)
      setTotal(postsRes.data.count || results.length)
      setCategories(catsRes.data || [])
    } catch (err) {
      console.error('Blog fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, search])

  // eslint-disable-next-line
  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    const p = new URLSearchParams(searchParams)
    if (searchInput) p.set('search', searchInput)
    else p.delete('search')
    setSearchParams(p)
  }

  const selectCategory = (slug) => {
    const p = new URLSearchParams(searchParams)
    if (slug) p.set('category', slug)
    else p.delete('category')
    p.delete('search')
    setSearchInput('')
    setSearch('')
    setSearchParams(p)
  }

  const featuredPosts = posts.filter(p => p.is_featured).slice(0, 3)
  const regularPosts = posts.filter(p => !p.is_featured || featuredPosts.length >= 3)

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead 
        title="TalentTap Blog | Recruitment Insights & Market Intelligence"
        description="Expert hiring guides, salary benchmarks, career advice, and the latest news from the global IT talent market."
      />
      <PublicNavbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-white pt-32 pb-16 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Rss className="h-3.5 w-3.5" /> TalentTap Blog
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Insights, Tips & Market <span className="text-primary">Intelligence</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Expert hiring guides, salary benchmarks, career advice, and the latest news from the global IT talent market.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <Search className="ml-2 h-5 w-5 flex-shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, topics, keywords..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* ── Main Content ─────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Category pills */}
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                onClick={() => selectCategory('')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  !activeCategory
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
                }`}
              >
                All Articles
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => selectCategory(cat.slug)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === cat.slug
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat.name}
                  {cat.post_count > 0 && (
                    <span className="ml-1.5 rounded-full bg-current/10 px-1.5 py-0.5 text-xs">{cat.post_count}</span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">📝</div>
                <h3 className="text-lg font-semibold text-slate-800">No articles found</h3>
                <p className="mt-1 text-slate-500">Try a different search or category.</p>
                <button onClick={() => selectCategory('')} className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Featured grid */}
                {featuredPosts.length > 0 && !activeCategory && !search && (
                  <div className="mb-8">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      <TrendingUp className="h-4 w-4" /> Featured Articles
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {featuredPosts.map(p => <PostCard key={p.id} post={p} featured />)}
                    </div>
                  </div>
                )}

                {/* Regular posts or all posts when filtered */}
                {(activeCategory || search ? posts : regularPosts).length > 0 && (
                  <div>
                    {!activeCategory && !search && (
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Latest Articles</h2>
                        <span className="text-xs text-slate-400">{total} total</span>
                      </div>
                    )}
                    <div className="space-y-3">
                      {(activeCategory || search ? posts : regularPosts).map(p => (
                        <PostCard key={p.id} post={p} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            {/* Categories */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Tag className="h-4 w-4 text-primary" /> Browse Categories
              </h3>
              <ul className="space-y-1">
                {categories.map(cat => {
                  const colour = COLOUR_MAP[cat.color] || 'bg-slate-100 text-slate-700'
                  return (
                    <li key={cat.slug}>
                      <button
                        onClick={() => selectCategory(cat.slug)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                          activeCategory === cat.slug
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colour}`}>
                          {cat.post_count}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-white shadow-lg">
              <h3 className="text-base font-bold mb-2">Ready to Hire Smarter?</h3>
              <p className="text-sm text-white/80 mb-4">
                Join software houses worldwide using TalentTap's AI matching engine.
              </p>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-white/90 transition-colors"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
