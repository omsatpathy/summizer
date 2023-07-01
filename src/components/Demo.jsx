import { useState, useEffect } from "react"
import { copy, linkIcon, loader, tick }  from '../assets'
import { useLazyGetSummaryQuery } from '../services/article'

const Demo = () => {
  const [article, setArticle] = useState({
    url: '',
    summary: ''
  })

  //for keeping a histiry of last 5 articles 
  const [allArticles, setAllArticles] = useState([])

  //to copy the url show belwo the search bar
  const [copied, setCopied] = useState('')

  //as its a lazy query, we first pass a func getSumamry, whcih is gonna execute the hook
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery()

  //store all articles in localstorage
  useEffect(()=> {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem('articles')
    )

    if(articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage)
    }
  }, [])

  // func to make our API request
  const handleSubmit = async (e) => {
    e.preventDefault()

    const { data } = await getSummary({ articleUrl: article.url })
    if(data?.summary) {
      const newArticle = {...article, summary: data.summary}
      const updatedAllArticles = [newArticle, ...allArticles]
      setArticle(newArticle)
      setAllArticles(updatedAllArticles)

      localStorage.setItem('articles', JSON.stringify(updatedAllArticles))
    }
  }

  //func to handle copied urls
  const handleCopy = (copiedUrl) => {
    setCopied(copiedUrl)
    navigator.clipboard.writeText(copiedUrl)

    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search  */}
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img src={linkIcon} alt="link_icon"
            className="absolute left-0 my-2 ml-3 wy-5"
           />
           <input type="url" 
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e) => setArticle({...article, url: e.target.value})}
            required
            className="url_input peer"
           />
           <button
            type="submit"
            className="submit_btn
            peer-focus:border-gray-700
            peer-focus:text-gray-700"
           >
            Go
           </button>
        </form>

        {/* Browse URL history */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          { 
            allArticles.map((item, index) => (

                <div
                  key={`link-${index}`}
                  className="link_card"
                >
                  <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                  <img src={ copied === item.url ? tick: copy } alt="copy_icon" className="w-[40%] h-[40%] object-contain"/>
                  </div>
                  <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate" onMouseDown={() => setArticle(item)}>{item.url}</p>
                </div>
            ))
           }
        </div>

      </div>

      {/* Display results */}
      <div className="my-10 max-w-full flex justify-center items-center">
           {isFetching ? (
            <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
           ): error ? (
            <p className="font-inter font-bold text-black text-center">
              Sorry, we could not summarize that for you
              <br />
              <span className="font-satoshi font-normal text-gray-700">
                {error?.data?.error}
              </span>
            </p>
           ): (
            article.summary && (
              <div className="flex flex-col gap-3">
                <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                  Article <span className="blue_gradient">Summary</span>
                </h2>
                <div className="summary_box">
                  <p className="font-inter font-medium text-sm text-gray-700">{article.summary}</p>
                </div>
              </div>
            )
           )}
      </div>
    </section>
  )
}

export default Demo