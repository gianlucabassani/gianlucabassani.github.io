import { useEffect, useState } from 'react';

/** Reuse build-time content on a direct visit; fetch only for later navigation. */
export default function useArticleContent(path:string, load:(path:string) => Promise<string>, initialContent?:string) {
  const [state, setState] = useState({path, content:initialContent || '', isLoading:initialContent === undefined});
  useEffect(() => {
    if (initialContent !== undefined) {
      setState({path, content:initialContent, isLoading:false});
      return;
    }
    let cancelled = false;
    setState({path, content:'', isLoading:true});
    load(path).then(content => {
      if (!cancelled) setState({path, content, isLoading:false});
    });
    return () => { cancelled = true; };
  }, [path, load, initialContent]);
  return state.path === path ? state : {content:'', isLoading:true};
}
