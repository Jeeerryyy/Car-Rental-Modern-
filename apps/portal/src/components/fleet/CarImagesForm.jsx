import React from 'react';

export default function CarImagesForm({ car, keepImageIds, handleImageRemove, handleNewImages }) {
  return (
    <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant">
      <h2 className="text-lg font-semibold mb-4">Car Images</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {car?.images?.filter(img => keepImageIds.includes(img.publicId)).map((img, i) => (
          <div key={i} className="relative group">
            <img src={img.url} alt={`Car ${i}`} className="w-full h-32 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => handleImageRemove(img.publicId)}
              className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-medium">Add New Images</span>
        <input type="file" multiple accept="image/*" onChange={handleNewImages} className="mt-1 block w-full" />
      </label>
    </div>
  );
}
