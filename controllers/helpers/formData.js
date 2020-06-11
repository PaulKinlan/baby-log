// Safari's messed up formData on the request object.

export default async (request) => {
  const data = await request.arrayBuffer();
  const decoder = new TextDecoder("utf-8")
  const params = new URLSearchParams(`?${decoder.decode(data)}`);

  return params;
};