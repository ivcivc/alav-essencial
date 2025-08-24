import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  lazy?: boolean
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  lazy = true,
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!lazy || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [lazy])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setIsError(true)
    onError?.()
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {(!isLoaded && !isError) && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
          style={{ 
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!placeholder && (
            <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
          )}
        </div>
      )}

      {/* Imagem principal */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isError && 'hidden'
          )}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }}
        />
      )}

      {/* Error fallback */}
      {isError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 bg-muted-foreground/20 rounded" />
            <p className="text-xs">Erro ao carregar</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para preload de imagens críticas
export function useImagePreload(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })

    return () => {
      // Cleanup se necessário
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]')
      preloadLinks.forEach(link => {
        if (urls.includes((link as HTMLLinkElement).href)) {
          link.remove()
        }
      })
    }
  }, [urls])
}
