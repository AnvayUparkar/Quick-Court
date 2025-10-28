import React, { useRef, useEffect, useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    if (imageRef.current) {
      observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '100px' }
      );
      observer.observe(imageRef.current);
    }

    return () => {
      if (observer && imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src]);

  return <img ref={imageRef} src={imageSrc || '/placeholder.svg'} alt={alt} {...props} />;
};

export default LazyImage;
