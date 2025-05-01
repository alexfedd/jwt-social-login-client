import React, { useEffect } from "react";
import { getFile } from "../util/ApiUtil";
import { use } from "react";

export const Image = ({file}) => {
  const [fileUrl, setFileUrl] = React.useState("");
  useEffect(() => {
    getFile(file).then((response) => {
      setFileUrl(response.url);
    });
  }, []);
  return (
    <img
      src={fileUrl ?? ''}
      alt="Attached"
      style={{ maxWidth: "200px", width: "100%", marginBottom: "10px" }}
    />
  );
};
