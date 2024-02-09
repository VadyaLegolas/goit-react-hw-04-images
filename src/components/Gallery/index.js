import PhotosApiService from './pixabay-api';

import getRefs from './get-refs';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SearchBtn from './search-btn';

const refs = getRefs();
const photosApiService = new PhotosApiService();
const searchBtn = new SearchBtn('.js-search-btn');

let lightbox;

// Observer
let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);
function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      onLoadMore();
    }
  });
}

refs.form.addEventListener('submit', onFormSubmit);
// refs.more.addEventListener('click', onLoadMore);

async function onFormSubmit(e) {
  e.preventDefault();
  clearMarkup();
  photosApiService.query = e.currentTarget.elements.searchQuery.value;
  if (photosApiService.query === '') {
    return Notify.warning(`Nothing to search!!!`);
  }
  searchBtn.disable();
  photosApiService.resetPage();
  try {
    const data = await photosApiService.fetchPhotos();
    if (data.totalHits === 0) {
      throw new Error();
    }
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    appendPhotosMarkup(data);
    searchBtn.enable();

    lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });

    const { height: cardHeight } =
      refs.gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    observer.observe(refs.jsGuard);
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    searchBtn.enable();
  }
}

async function onLoadMore() {
  refs.loader.classList.remove('is-hidden');

  try {
    const data = await photosApiService.fetchPhotos();

    const totalPages = Math.ceil(
      (data.totalHits + 1) / photosApiService.perPage
    );
    if (photosApiService.page - 1 === totalPages) {
      observer.unobserve(refs.jsGuard);
      Notify.info("We're sorry, but you've reached the end of search results.");
    }

    appendPhotosMarkup(data);

    lightbox.refresh();
    refs.loader.classList.add('is-hidden');
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function appendPhotosMarkup(data) {
  refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data));
}

function createMarkup(data) {
  return data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a href="${largeImageURL}">
        <div class="photo-card">
        <div class="photo-card__img">
        <img src="${webformatURL}" alt="${tags}" width="300px" height="200px" loading="lazy" />
        </div>
          <div class="info">
            <p class="info-item">
              <b>Likes: </b><span>${likes}</span>
            </p>
            <p class="info-item">
              <b>Views: </b><span>${views}</span>
            </p>
            <p class="info-item">
              <b>Comments: </b><span>${comments}</span>
            </p>
            <p class="info-item">
              <b>Downloads: </b><span>${downloads}</span>
            </p>
          </div>
        </div></a>`
    )
    .join('');
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}
