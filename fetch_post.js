const url = "https://suhtmsmcajddyqjaeuks.supabase.co/rest/v1/posts?slug=eq.qr-code-personalizado&select=content";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aHRtc21jYWpkZHlxamFldWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDYwMDksImV4cCI6MjA4NTQ4MjAwOX0.Oe8mtruK1GiBKE4o0oHm_kPbWQ-NvljfOzsC7gGpW2A";

fetch(url, {
  headers: {
    "apikey": apiKey,
    "Authorization": `Bearer ${apiKey}`
  }
})
.then(r => r.json())
.then(data => {
  console.log("--- DATA START ---");
  console.log(JSON.stringify(data[0], null, 2));
  console.log("--- DATA END ---");
})
.catch(e => console.error(e));
