import React, { useEffect, useState } from "react";
import { getFile } from "../../util/ApiUtil";

const FileLink = ({ file }) => {
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    getFile(file).then((response) => {
      setFileUrl(response.url);
    });
  }, [file]);

  return (
    <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
      Download File
    </a>
  );
};

export default FileLink;