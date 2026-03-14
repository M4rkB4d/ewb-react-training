// src/components/PageTitle.tsx
import { useEffect } from 'react';

function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | EastWest Bank`;
  }, [title]);

  return <h1>{title}</h1>;
}

export default PageTitle;
