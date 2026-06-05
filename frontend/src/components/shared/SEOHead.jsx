import { useEffect } from 'react'

export default function SEOHead({ title, description, keywords, ogImage, canonicalUrl }) {
  useEffect(() => {
    if (!title) return

    // 1. Update Title
    const originalTitle = document.title
    document.title = title

    // Helper to update or create meta tags
    const updateMetaTag = (selector, attributeName, attributeValue, content) => {
      let tag = document.querySelector(selector)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attributeName, attributeValue)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
      return tag
    }

    // Helper to update or create link tags (for canonical)
    const updateLinkTag = (rel, href) => {
      let tag = document.querySelector(`link[rel="${rel}"]`)
      if (!tag) {
        tag = document.createElement('link')
        tag.setAttribute('rel', rel)
        document.head.appendChild(tag)
      }
      tag.setAttribute('href', href)
      return tag
    }

    // 2. Update Standard SEO Tags
    if (description) {
      updateMetaTag('meta[name="description"]', 'name', 'description', description)
      updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
      updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    }

    if (keywords) {
      updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords)
    }

    // 3. Update Open Graph / Social Tags
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title)
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website')
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title)

    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage)
      updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)
    }

    if (canonicalUrl) {
      updateLinkTag('canonical', canonicalUrl)
      updateMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    }

    // Cleanup on unmount
    return () => {
      document.title = originalTitle
      // Note: We don't necessarily remove the meta tags on unmount because the next page
      // will overwrite them. However, for strict cleanup, we could remove them.
      // For a global SPA, overwriting is generally sufficient and prevents flickering.
    }
  }, [title, description, keywords, ogImage, canonicalUrl])

  return null
}
