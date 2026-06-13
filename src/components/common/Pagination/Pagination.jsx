import './Pagination.css';

const getPaginationItems = (page, totalPages) => {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let startPage = Math.floor((page - 1) / maxVisiblePages) * maxVisiblePages + 1;
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  const pages = [];

  for (let currentPage = startPage; currentPage <= endPage; currentPage += 1) {
    pages.push(currentPage);
  }

  if (endPage < totalPages) {
    pages.push('...');
    pages.push(totalPages);
  }

  if (startPage > 1) {
    pages.unshift('...');
    pages.unshift(1);
  }

  return pages;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const paginationItems = getPaginationItems(page, totalPages);

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-arrow"
        disabled={isFirstPage}
        onClick={() => onPageChange(page - 1)}
      >
        {'<'}
      </button>

      <div className="pagination-pages">
        {paginationItems.map((item, index) => {
          if (item === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }

          return (
            <button
              key={item}
              type="button"
              className={
                item === page
                  ? 'pagination-page active'
                  : 'pagination-page'
              }
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="pagination-arrow"
        disabled={isLastPage}
        onClick={() => onPageChange(page + 1)}
      >
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;
