import React from 'react';
import CarCard from '../shared/CarCard';
import { ChevronLeftIcon, ChevronRightIcon, CarIcon } from '../ui/Icons';

export default function CarGrid({ loading, error, paginatedCars, localFilters, setCommittedFilters, clearFilters, totalPages, currentPage, setCurrentPage }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-[12px] overflow-hidden flex flex-col h-[400px]" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
            <div className="h-[220px] skeleton" />
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div><div className="h-6 w-3/4 skeleton mb-2" /><div className="h-4 w-1/2 skeleton mb-4" /></div>
              <div className="h-10 w-full skeleton mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[12px] p-12 text-center" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
        <p className="font-bold mb-4" style={{ color: '#b91c1c' }}>{error}</p>
        <button onClick={() => setCommittedFilters({ ...localFilters })} className="btn-outline">Retry</button>
      </div>
    );
  }

  if (paginatedCars.length === 0) {
    return (
      <div className="rounded-[12px] p-12 text-center" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}>
        <CarIcon className="w-12 h-12 mb-4 block mx-auto" style={{ color: 'rgba(25,19,14,0.15)' }} />
        <h3 className="font-display text-2xl font-bold mb-2" style={{ color: '#19130E' }}>No vehicles found</h3>
        <p className="mb-6" style={{ color: '#6b5e50' }}>We couldn't find any cars matching your current filters.</p>
        <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
      </div>
    );
  }

  const pagBtnStyle = (active) => ({
    background: active ? '#19130E' : '#F2EEE5',
    color: active ? '#F9F8F3' : '#19130E',
    border: active ? '1px solid #19130E' : '1px solid rgba(182,124,61,0.15)',
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedCars.map((car) => (<CarCard key={car._id} id={car._id} car={car} />))}
      </div>
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="w-10 h-10 rounded-[8px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed" style={pagBtnStyle(false)}>
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className="w-10 h-10 rounded-[8px] font-bold flex items-center justify-center" style={pagBtnStyle(currentPage === page)}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-[8px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed" style={pagBtnStyle(false)}>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
