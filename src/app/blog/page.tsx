import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Extract YouTube Transcripts - Complete Guide',
  description: 'Learn how to download YouTube transcripts for free. Step-by-step guide for single videos, bulk extraction, and channel transcripts.',
}

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <article className="prose lg:prose-xl">
        <h1>How to Extract YouTube Transcripts</h1>
        
        <p>
          YouTube transcripts are incredibly useful for content creators, researchers, 
          students, and anyone who wants to analyze or repurpose video content. Here's 
          everything you need to know about extracting transcripts.
        </p>

        <h2>Why Extract YouTube Transcripts?</h2>
        <ul>
          <li>Create blog posts from video content</li>
          <li>Translate videos to other languages</li>
          <li>Make content accessible for hearing-impaired viewers</li>
          <li>Analyze video content at scale</li>
          <li>Create study notes from educational videos</li>
        </ul>

        <h2>Method 1: Single Video Transcript (Free)</h2>
        <p>
          To extract a transcript from a single YouTube video:
        </p>
        <ol>
          <li>Copy the YouTube video URL</li>
          <li>Paste it into our extractor at <a href="/">get-youtube-transcripts.io</a></li>
          <li>Click "Extract Transcript"</li>
          <li>Download your transcript instantly</li>
        </ol>
        <p>No login required for single video transcripts!</p>

        <h2>Method 2: Bulk Transcript Extraction</h2>
        <p>
          Need transcripts from multiple videos? Our bulk extraction feature allows you to:
        </p>
        <ul>
          <li>Process up to 500 videos at once</li>
          <li>Upload a CSV file with multiple URLs</li>
          <li>Extract all videos from a channel</li>
          <li>Get AI-powered summaries of each transcript</li>
        </ul>

        <h2>Method 3: Channel Transcript Extraction</h2>
        <p>
          Extract transcripts from an entire YouTube channel's latest 500 videos 
          automatically. Perfect for:
        </p>
        <ul>
          <li>Content analysis</li>
          <li>Competitive research</li>
          <li>Building training datasets</li>
          <li>Archiving educational content</li>
        </ul>

        <h2>Pricing</h2>
        <p>
          <strong>Free:</strong> Single video transcripts with no login required
        </p>
        <p>
          <strong>Premium (₹999/month):</strong> 1000 transcripts per month, bulk extraction, 
          channel extraction, CSV upload, and AI summaries. Sign up to get 25 free downloads!
        </p>

        <p>
          <a href="/pricing" className="text-blue-600 hover:underline">
            View full pricing details →
          </a>
        </p>

        <h2>Frequently Asked Questions</h2>
        
        <h3>Are YouTube transcripts accurate?</h3>
        <p>
          Transcript accuracy depends on whether the video has manually added captions or 
          auto-generated ones. Manual captions are typically 95%+ accurate, while 
          auto-generated captions vary by audio quality and accent clarity.
        </p>

        <h3>Can I extract transcripts from any YouTube video?</h3>
        <p>
          You can extract transcripts from any public YouTube video that has captions enabled. 
          Private videos, age-restricted content, or videos without captions cannot be extracted.
        </p>

        <h3>What formats are supported?</h3>
        <p>
          Transcripts can be downloaded in plain text format, making them easy to use in 
          any application or document.
        </p>

        <div className="bg-blue-50 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-bold mb-2">Ready to get started?</h3>
          <p className="mb-4">
            Extract your first YouTube transcript now - no signup required for single videos!
          </p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Extract Transcript Now
          </a>
        </div>
      </article>
    </div>
  )
}