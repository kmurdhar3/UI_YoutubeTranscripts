export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "YouTube Transcript Extractor",
    "url": "https://get-youtube-transcripts.io",
    "description": "Extract YouTube transcripts from single videos, bulk process up to 500 videos, or get channel transcripts with AI-powered summaries",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "description": "Free single transcript extraction, premium bulk features starting at ₹999/month"
    },
    "featureList": [
      "Single video transcript extraction (Free)",
      "Bulk transcript extraction (up to 500 videos)",
      "Channel transcript extraction (latest 500 videos)",
      "CSV upload for batch processing",
      "AI-powered transcript summary",
      "25 free downloads for registered users"
    ],
    "operatingSystem": "Web Browser",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}