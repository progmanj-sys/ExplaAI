export default {
  async fetch(request) {
    return new Response("ExplaAI Worker is alive!", {
      headers: { "content-type": "text/plain" }
    });
  }
};
