import { EditTableButtonIcon } from "@/assets/svg";
import { Button } from "@/components/common";
import { getUserNameInitials } from "../../utils/helpers";
import { getUserData } from "@/utils/storage";

import "./styles.scss";

const Comment = ({ comment, handleShowEditModal, displayLatestStatus }) => {
  const { email: currentUserEmail } = getUserData();
  return (
    <section className="comment-main-container">
      <section className="comment-header-container">
        <article className="comment-user-wrapper">
          <p className="user-avatar">
            {getUserNameInitials(comment?.creationUserFullName)}
          </p>
          <p className="user-name">{comment?.creationUserFullName}</p>
        </article>

        {(displayLatestStatus() === "IN_PROGRESS" || displayLatestStatus() === "INCOMING") &&
          handleShowEditModal && comment?.creationUser === currentUserEmail && (
            <Button
              buttonType="iconOnly"
              classes="edit-comment-button"
              icon={<EditTableButtonIcon />}
              handleClick={() => handleShowEditModal(comment)}
            />
        )}
      </section>

      <article className="comment-content-wrapper">
        <p className="comment">{comment?.commentText}</p>
        {/* <p className="time">10 min ago</p> */}
        <p className="time">{comment?.creationDate}</p>
      </article>
    </section>
  );
};

export default Comment;
