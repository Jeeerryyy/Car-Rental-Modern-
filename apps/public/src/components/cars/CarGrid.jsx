import React from 'react';
import CarCard from '../shared/CarCard';
import { ChevronLeftIcon, ChevronRightIcon, CarIcon } from '../ui/Icons';

export default function CarGrid({
  loading,
  error,
  paginatedCars,
  localFilters,
  setCommittedFilters,
  clearFilters,
  totalPages,
  currentPage,
  setCurrentPage
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-[var(--radius-md)] overflow-hidden border border-border shadow-sm flex flex-col h-[400px]">
            <div className="h-[220px] skeleton" />
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="h-6 w-3/4 skeleton mb-2" />
                <div className="h-4 w-1/2 skeleton mb-4" />
              </div>
              <div className="h-10 w-full skeleton mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[var(--radius-lg)] p-12 text-center border border-red-100">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button onClick={() => setCommittedFilters({ ...localFilters })} className="btn-outline">Retry</button>
      </div>
    );
  }

  if (paginatedCars.length === 0) {
    return (
      <div className="bg-white rounded-[var(--radius-lg)] p-12 text-center border border-border">
        <CarIcon className="w-12 h-12 text-muted/30 mb-4 block mx-auto" />
        <h3 className="font-display text-2xl font-bold text-dark mb-2">No vehicles found</h3>
        <p className="text-muted mb-6">We couldn't find any cars matching your current filters.</p>
        <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedCars.map((car) => (
          <CarCard key={car._id} id={car._id} car={car} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-md border border-border bg-white flex items-center justify-center text-muted hover:border-dark hover:text-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-md border font-bold flex items-center justify-center transition-colors ${currentPage === page ? 'border-dark bg-dark text-white' : 'border-border bg-white text-dark hover:border-dark'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-md border border-border bg-white flex items-center justify-center text-muted hover:border-dark hover:text-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
