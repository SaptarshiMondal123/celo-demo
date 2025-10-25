from transformers import pipeline

# lightweight summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_report(content: str) -> str:
    """
    Summarizes long textual report content.
    """
    text = content.decode("utf-8") if isinstance(content, bytes) else content
    text_to_summarize = f"Summarize this text WITHOUT changing the sentence order: {text}"
    summary = summarizer(text_to_summarize[:3000], max_length=120, min_length=40, do_sample=False)
    return summary[0]['summary_text']