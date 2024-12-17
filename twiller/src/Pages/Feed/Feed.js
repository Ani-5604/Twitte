import React, { useEffect, useState } from "react";
import "./Feed.css";
import Posts from "./Posts/Posts";
import Tweetbox from "./Tweetbox/Tweetbox";
import { useTranslation } from "react-i18next";

const Feed = () => {
  const [post, setpost] = useState([]);
  const [loading, setLoading] = useState(true);
const {t}=useTranslation();
  useEffect(() => {
    fetch("http://localhost:5000/post")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => {
        setpost(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleNewPost = (newPost) => {
    setpost((prevPosts) => [newPost, ...prevPosts]);
  };

  return (

    <div className="feed">
      <div className="feed__header">
        <h2>{t("Home")}</h2>
      </div>
      <Tweetbox onNewPost={handleNewPost} />
      {loading ? (
        <p>{t("Loading posts...")}</p>
      ) : post.length === 0 ? (
        <p>{t("No posts to show. Be the first to post!")}</p>
      ) : (
        post.map((p) => <Posts key={p._id} p={p} />)
      )}
    </div>
  );
};

export default Feed;
