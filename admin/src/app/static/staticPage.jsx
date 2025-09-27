import React from "react";
import { db } from "../../../config/db";

export const StaticPage = async () => {
  const data = await db.execute("select * from user");
  console.log(data);
  return <div>staticPage</div>;
};
