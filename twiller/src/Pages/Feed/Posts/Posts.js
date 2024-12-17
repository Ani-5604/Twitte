import React, { useState } from "react";
import PropTypes from "prop-types";
import "./Posts.css";
import {
  Avatar,
  Button,
  TextField,
} from "@mui/material";

import {
  VerifiedUser as VerifiedUserIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Repeat as RepeatIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";

const Posts = ({ p, onDeletePost }) => {
  const { id, name, username, photo, post, profilephoto } = p;

  // State management
  const [comments, setComments] = useState([]); // List of comments
  const [newComment, setNewComment] = useState(""); // Current comment input
  const [showCommentBox, setShowCommentBox] = useState(false); // Toggle comment box
  const [likes, setLikes] = useState(0); // Like count
  const [liked, setLiked] = useState(false); // Like state

  // Handle adding a new comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments((prevComments) => [...prevComments, newComment]);
      setNewComment(""); // Clear input
    }
  };

  // Handle deleting the post
  const handleDeletePost = () => {
    if (typeof onDeletePost === "function") {
      onDeletePost(id);
    } else {
      console.error("onDeletePost is not a function!");
    }
  };

  // Toggle the visibility of the comment box
  const handleToggleCommentBox = () => {
    setShowCommentBox((prev) => !prev);
  };

  // Handle liking or unliking the post
  const handleLike = () => {
    setLikes((prevLikes) => (liked ? prevLikes - 1 : prevLikes + 1));
    setLiked((prevLiked) => !prevLiked);
  };

  return (
    <div className="post">
      {/* Avatar */}
      <div className="post__avatar">
        <Avatar src={profilephoto} />
      </div>

      {/* Post Body */}
      <div className="post__body">
        {/* Header Section */}
        <div className="post__header">
          <div className="post__headerText">
            <h3>
              {name}{" "}
              <span className="post__headerSpecial">
                <VerifiedUserIcon className="post__badge" /> @{username}
              </span>
            </h3>
          </div>
          <div className="post__headerDescription">
            <p>{post}</p>
          </div>
        </div>

        {/* Post Image */}
        {photo && <img src={photo} alt="Post" width="500" />}

        {/* Footer Section */}
        <div className="post__footer">
          {/* Comment Button */}
          <ChatBubbleOutlineIcon
            className="post__footer__icon"
            fontSize="small"
            onClick={handleToggleCommentBox}
          />

          {/* Repeat Button */}
          <RepeatIcon className="post__footer__icon" fontSize="small" />

          {/* Like Button */}
          {liked ? (
            <FavoriteIcon
              className="post__footer__icon post__liked"
              fontSize="small"
              onClick={handleLike}
            />
          ) : (
            <FavoriteBorderIcon
              className="post__footer__icon"
              fontSize="small"
              onClick={handleLike}
            />
          )}
          <span>{likes}</span>

          {/* Delete Button */}
          <DeleteIcon
            className="post__footer__icon post__delete"
            fontSize="small"
            onClick={handleDeletePost}
          />

          {/* Publish Button */}
          <PublishIcon className="post__footer__icon" fontSize="small" />
        </div>

        {/* Comment Section */}
        {showCommentBox && (
          <div className="post__comments">
            <h4>Comments:</h4>

            {/* Render Comments */}
            {comments.length > 0 ? (
              <ul>
                {comments.map((comment, index) => (
                  <li key={index} className="comment">
                    <Avatar
                      src={profilephoto}
                      sx={{ width: 30, height: 30, marginRight: "8px" }}
                    />
                    <span>{comment}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}

            {/* Add New Comment */}
            <form onSubmit={handleAddComment} className="post__commentForm">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!newComment.trim()}
              >
                Add
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Prop Type Validation
Posts.propTypes = {
  p: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    photo: PropTypes.string,
    post: PropTypes.string.isRequired,
    profilephoto: PropTypes.string,
  }).isRequired,
  onDeletePost: PropTypes.func.isRequired,
};

export default Posts;
