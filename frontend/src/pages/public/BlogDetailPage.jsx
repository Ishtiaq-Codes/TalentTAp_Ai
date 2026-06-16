import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, Calendar, User, Tag, ArrowRight, Rss, Link2, Check } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { blogAPI } from '@/api/blog'

const COLOUR_MAP = {
 blue:  'bg-blue-100 text-blue-700',
 green: 'bg-green-100 text-green-700',
 purple: 'bg-purple-100 text-purple-700',
 amber: 'bg-amber-100 text-amber-700',
 teal:  'bg-teal-100 text-teal-700',
 rose:  'bg-rose-100 text-rose-700',
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
   document.title = 'TalentTap AI - AI-Powered Talent Marketplace'
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
     <Clock className="h-3 w-3"/> {post.reading_time_minutes} min read
    </p>
   </div>
  </Link>
 )
}

const LinkedinIcon = ({ className }) => (
 <svg className={className} fill="currentColor"viewBox="0 0 24 24">
  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
 </svg>
);

const TwitterIcon = ({ className }) => (
 <svg className={className} fill="currentColor"viewBox="0 0 24 24">
  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
 </svg>
);

const FacebookIcon = ({ className }) => (
 <svg className={className} fill="currentColor"viewBox="0 0 24 24">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
 </svg>
);

function ShareWidget({ url, title }) {
 const [copied, setCopied] = useState(false)

 const encodedUrl = encodeURIComponent(url)
 const encodedTitle = encodeURIComponent(title)

 const handleCopy = () => {
  navigator.clipboard.writeText(url)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }

 return (
  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
   <h3 className="mb-3 text-sm font-bold text-slate-800">Share this article</h3>
   <div className="flex items-center justify-center gap-3">
    <a
     href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
     target="_blank"
     rel="noopener noreferrer"
     className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#0077b5] hover:text-white transition-colors shadow-sm"
     aria-label="Share on LinkedIn"
    >
     <LinkedinIcon className="h-4 w-4"/>
    </a>
    <a
     href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
     target="_blank"
     rel="noopener noreferrer"
     className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors shadow-sm"
     aria-label="Share on Twitter"
    >
     <TwitterIcon className="h-4 w-4"/>
    </a>
    <a
     href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
     target="_blank"
     rel="noopener noreferrer"
     className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#1877F2] hover:text-white transition-colors shadow-sm"
     aria-label="Share on Facebook"
    >
     <FacebookIcon className="h-4 w-4"/>
    </a>
    <button
     onClick={handleCopy}
     className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-colors shadow-sm"
     aria-label="Copy link"
     title={copied ?"Copied!":"Copy Link"}
    >
     {copied ? <Check className="h-4 w-4 text-green-500"/> : <Link2 className="h-4 w-4"/>}
    </button>
   </div>
  </div>
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

 if (notFound) return <Navigate to="/blog"replace />

 const publishedDate = post?.published_at
  ? new Date(post.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  : ''

 const catColour = post?.category ? (COLOUR_MAP[post.category.color] || 'bg-slate-100 text-slate-700') : ''

 return (
  <div className="min-h-screen bg-background">
   <SEOHead post={post} />
   <PublicNavbar />

   {/* Loading skeleton */}
   {loading && (
    <div className="mx-auto max-w-4xl px-4 pt-32 pb-20 sm:px-6">
     <div className="animate-pulse space-y-4">
      <div className="h-5 w-32 rounded-full bg-slate-200"/>
      <div className="h-10 w-3/4 rounded-xl bg-slate-200"/>
      <div className="h-5 w-48 rounded-full bg-slate-200"/>
      <div className="h-64 rounded-2xl bg-slate-200"/>
      <div className="space-y-3">
       {[...Array(8)].map((_, i) => <div key={i} className="h-4 rounded bg-slate-200"/>)}
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
        <Link to="/blog"className="flex items-center gap-1 hover:text-primary transition-colors">
         <Rss className="h-3.5 w-3.5"/> Blog
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
         <User className="h-4 w-4"/>
         {post.author_name}
        </span>
        <span className="flex items-center gap-1.5">
         <Calendar className="h-4 w-4"/>
         {publishedDate}
        </span>
        <span className="flex items-center gap-1.5">
         <Clock className="h-4 w-4"/>
         {post.reading_time_minutes} min read
        </span>
        <span className="flex items-center gap-1.5">
         <Eye className="h-4 w-4"/>
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
           className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
           <Tag className="h-3 w-3"/> {tag.name}
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
          prose-table:w-full prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-border
          prose-table:text-sm prose-th:bg-background prose-th:font-semibold
          prose-th:p-3 prose-td:p-3 prose-tr:border-b prose-tr:border-border
          prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1
        "
         dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back + CTA */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
         <Link to="/blog"className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4"/> Back to Blog
         </Link>
         <Link to="/register"className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-all">
          Get Started on TalentTap <ArrowRight className="h-4 w-4"/>
         </Link>
        </div>
       </article>

       {/* Sidebar */}
       <aside className="w-full lg:w-72 flex-shrink-0">
        {/* Related posts */}
        {relatedPosts.length > 0 && (
         <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Related Articles</h3>
          <div className="space-y-3">
           {relatedPosts.map(p => <RelatedPostCard key={p.id} post={p} />)}
          </div>
          <Link
           to={post.category ? `/blog?category=${post.category.slug}` : '/blog'}
           className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
          >
           More in {post.category?.name || 'Blog'} <ArrowRight className="h-3.5 w-3.5"/>
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
          Create Free Account <ArrowRight className="h-4 w-4"/>
         </Link>
        </div>

        {/* Share Widget */}
        <ShareWidget 
         url={window.location.href} 
         title={post.title} 
        />
       </aside>
      </div>
     </div>
    </>
   )}

   <Footer />
  </div>
 )
}
