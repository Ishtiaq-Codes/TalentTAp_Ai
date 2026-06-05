import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, Calendar, User, Tag, ArrowRight, Rss } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { blogAPI } from '@/api/blog'

const COLOUR_MAP = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  amber:  'bg-amber-100 text-amber-700',
  teal:   'bg-teal-100 text-teal-700',
  rose:   'bg-rose-100 text-rose-700',
}

function SEOHead({ post }) {
  useEffect(() => {
    if (!post) return
    // Title
    const title = post.effective_seo_title || post.seo_title || post.title
    document.title = `${title} | TalentTap Blog`

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', post.seo_description || post.excerpt || '')

    // Keywords
    if (post.seo_keywords) {
      let metaKw = document.querySelector('meta[name="keywords"]')
      if (!metaKw) {
        metaKw = document.createElement('meta')
        metaKw.setAttribute('name', 'keywords')
        document.head.appendChild(metaKw)
      }
      metaKw.setAttribute('content', post.seo_keywords)
    }

    // Open Graph tags
    const ogTags = {
      'og:title': title,
      'og:description': post.seo_description || post.excerpt || '',
      'og:type': 'article',
      'og:image': post.og_image_url || post.cover_image_url || '',
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': post.seo_description || post.excerpt || '',
    }
    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`) ||
                document.querySelector(`meta[name="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        if (property.startsWith('twitter')) tag.setAttribute('name', property)
        else tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // Canonical
    if (post.canonical_url) {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', post.canonical_url)
    }

    // Cleanup on unmount
    return () => {
      document.title = 'TalentTap AI — AI-Powered Talent Marketplace'
    }
  }, [post])

  return null
}

function RelatedPostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group flex gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex-1 min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">
          {post.title}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" /> {post.reading_time_minutes} min read
        </p>
      </div>
    </Link>
  )
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await blogAPI.getPost(slug)
        setPost(res.data)

        // Fetch related posts from same category
        if (res.data.category?.slug) {
          const relRes = await blogAPI.getPosts({ category: res.data.category.slug, page_size: 4 })
          const all = relRes.data.results || relRes.data || []
          setRelatedPosts(all.filter(p => p.slug !== slug).slice(0, 3))
        }
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
    window.scrollTo(0, 0)
  }, [slug])

  if (notFound) return <Navigate to="/blog" replace />

  const publishedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const catColour = post?.category ? (COLOUR_MAP[post.category.color] || 'bg-slate-100 text-slate-700') : ''

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead post={post} />
      <PublicNavbar />

      {/* Loading skeleton */}
      {loading && (
        <div className="mx-auto max-w-4xl px-4 pt-32 pb-20 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-32 rounded-full bg-slate-200" />
            <div className="h-10 w-3/4 rounded-xl bg-slate-200" />
            <div className="h-5 w-48 rounded-full bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-4 rounded bg-slate-200" />)}
            </div>
          </div>
        </div>
      )}

      {!loading && post && (
        <>
          {/* ── Article Header ────────────────────────────────────────── */}
          <header className="bg-white pt-28 pb-10 border-b border-slate-100">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                <Link to="/blog" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Rss className="h-3.5 w-3.5" /> Blog
                </Link>
                {post.category && (
                  <>
                    <span>/</span>
                    <Link to={`/blog?category=${post.category.slug}`} className="hover:text-primary transition-colors">
                      {post.category.name}
                    </Link>
                  </>
                )}
              </div>

              {/* Category */}
              {post.category && (
                <Link to={`/blog?category=${post.category.slug}`}>
                  <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${catColour}`}>
                    {post.category.name}
                  </span>
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="mt-4 text-lg text-slate-500 leading-relaxed">{post.excerpt}</p>

              {/* Meta bar */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {publishedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.reading_time_minutes} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {post.view_count} views
                </span>
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={tag.slug}
                      to={`/blog?tag=${tag.slug}`}
                      className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Tag className="h-3 w-3" /> {tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* ── Cover Image ───────────────────────────────────────────── */}
          {post.cover_image_url && (
            <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-8">
              <img
                src={post.cover_image_url}
                alt={post.cover_image_alt || post.title}
                className="w-full rounded-2xl object-cover shadow-lg max-h-[480px]"
              />
            </div>
          )}

          {/* ── Main Content + Sidebar ─────────────────────────────────── */}
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-10 lg:flex-row">

              {/* Article body */}
              <article className="flex-1 min-w-0">
                <div
                  className="prose prose-slate prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-slate-900
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-slate-900
                    prose-ul:text-slate-600 prose-ol:text-slate-600
                    prose-li:my-1
                    prose-table:text-sm prose-th:bg-slate-50 prose-th:font-semibold
                    prose-img:rounded-xl prose-img:shadow-md
                    prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                  "
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Back + CTA */}
                <div className="mt-12 flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <Link to="/blog" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Blog
                  </Link>
                  <Link to="/register" className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-all">
                    Get Started on TalentTap <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="w-full lg:w-72 flex-shrink-0">
                {/* Related posts */}
                {relatedPosts.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
                    <h3 className="mb-4 text-sm font-bold text-slate-800">Related Articles</h3>
                    <div className="space-y-3">
                      {relatedPosts.map(p => <RelatedPostCard key={p.id} post={p} />)}
                    </div>
                    <Link
                      to={post.category ? `/blog?category=${post.category.slug}` : '/blog'}
                      className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      More in {post.category?.name || 'Blog'} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}

                {/* CTA card */}
                <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-white shadow-lg">
                  <h3 className="text-base font-bold mb-2">Hire Smarter with AI</h3>
                  <p className="text-sm text-white/80 mb-4">
                    TalentTap's AI matching engine ranks candidates by exact job fit. Free to start.
                  </p>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-white/90 transition-colors"
                  >
                    Create Free Account <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Share nudge */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
                  Found this article useful?<br />
                  <span className="font-medium text-slate-700">Share it with your network!</span>
                </div>
              </aside>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
