import { useState, useEffect, useRef } from 'react';
import { ImageGalleryItem } from 'components/ImageGalleryItem/ImageGalleryItem';
import { toast } from 'react-toastify';
import { Gallery } from './ImageGallery.styled';
import PhotosApiService from 'components/services/pixabay-api';
import { Loader } from 'components/Loader/Loader';
import { Button } from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';

export const ImageGallery = ({ query }) => {
  const [gallery, setGallery] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [page, setPage] = useState(1);
  const previousQueryRef = useRef('');

  useEffect(() => {
    const photosApiService = new PhotosApiService();
    const getPhotos = async (query, page, message = true) => {
      try {
        photosApiService.query = query;
        photosApiService.page = page;
        setIsLoadMore(false);
        const galleryFetch = await photosApiService.fetchPhotos();

        if (galleryFetch.totalHits === 0) {
          throw new Error(`Ничего не найдено по запросу "${query}"`);
        }
        if (page === 1) {
          toast.success(`Найдено ${galleryFetch.totalHits} картинок`);
        }
        setGallery(prevGallery => {
          if (prevGallery.hits) {
            return {
              totalHits: galleryFetch.totalHits,
              hits: [...prevGallery.hits, ...galleryFetch.hits],
            };
          } else {
            return {
              totalHits: galleryFetch.totalHits,
              hits: [...galleryFetch.hits],
            };
          }
        });
        photosApiService.totalPages = Math.ceil(
          galleryFetch.totalHits / photosApiService.perPage
        );
        if (photosApiService.totalPages > 1) {
          setIsLoadMore(true);
        }
        if (photosApiService.page === photosApiService.totalPages) {
          setIsLoadMore(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (query === '') {
      return;
    }
    setIsLoading(true);

    if (previousQueryRef.current !== query) {
      previousQueryRef.current = query;
      setGallery({});
      setPage(1);
      getPhotos(query, 1);
      return;
    }
    if (page !== 1) {
      getPhotos(query, page);
    }
  }, [page, query]);

  const tongleModal = () => {
    setShowModal(prevState => !prevState);
  };

  const addImageToModal = item => {
    setSelectedImage(item);
    tongleModal();
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <>
      {showModal && <Modal image={selectedImage} onClose={tongleModal} />}
      {error && <h1>{error}</h1>}
      {Object.keys(gallery).length !== 0 && (
        <Gallery className="gallery">
          {gallery.hits.map(({ id, webformatURL, tags, largeImageURL }) => {
            return (
              <ImageGalleryItem
                key={id}
                image={webformatURL}
                tag={tags}
                largeImage={largeImageURL}
                onClick={addImageToModal}
              />
            );
          })}
        </Gallery>
      )}
      {isLoading && <Loader />}
      {isLoadMore && <Button onLoadMore={loadMore}>LoadMore</Button>}
    </>
  );
};
