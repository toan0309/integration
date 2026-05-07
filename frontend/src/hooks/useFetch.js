import { useState } from "react";

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  return { loading, setLoading };
};
