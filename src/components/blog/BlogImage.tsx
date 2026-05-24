'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface BlogImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

export default function BlogImage({ src, alt, fallbackSrc = '/og-image.png', ...props }: BlogImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(fallbackSrc);
  useEffect(() => {
    // Debug log
    console.log(`Carregando imagem: ${src || 'URL não definida'}`);
    
    if (src) {
        setImgSrc(src);
    } else {
        setImgSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        console.error(`Erro ao carregar imagem: ${imgSrc}. Usando fallback.`);
        setImgSrc(fallbackSrc);
      }}
      // Lazy load por padrão, a menos que priority seja passado
      loading={props.priority ? undefined : "lazy"}
    />
  );
}
