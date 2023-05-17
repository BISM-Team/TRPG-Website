import type { HandleClientError } from "@sveltejs/kit";

export const handleError = async function ({ error }) {
  console.error("CLIENT ERROR: ", error);

  return {
    code: 500,
    message: "Unexpected Server Error, please contact us!!",
  };
} satisfies HandleClientError;
