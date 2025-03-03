import React from "react";

const SuggestionCards = ({ name, tag, link, imageurl, description, address }) => {

  const handleCardClick = () => {
    window.open(link, "_blank");
  };

  return (
    <div onClick={handleCardClick}>
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-2xl cursor-pointer border-gray-200 border-[1px] my-4">
        <img
          className="h-48 w-full"
          src={imageurl}
          alt={name}
        />
        <div className="p-6">
          <h4 className="font-semibold text-lg leading-tight truncate">
            {name}
          </h4>
          <div className="max-h-18 mt-2">
            <p className="line-clamp-4">
              {description}
            </p>
          </div>
          <div className="flex items-baseline mt-2">
            <span className="inline-block bg-primary-200 py-1 px-4 text-xs rounded-full uppercase font-semibold tracking-wide">
              {tag}
            </span>
          </div>
          <p className="text-gray-400 text-xs">{address}</p>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCards;
