import { useState, useEffect, useRef } from 'react';
import { ImageGalleryItem } from 'components/ImageGalleryItem/ImageGalleryItem';
import { toast } from 'react-toastify';
import { Gallery } from './ImageGallery.styled';
import PhotosApiService from 'components/services/pixabay-api';
import { Loader } from 'components/Loader/Loader';
import { Button } from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';

export const ImageGallery = ({ query }) => {
  const [gallery, setGallery] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [page, setPage] = useState(1);
  const isFirstRender = useRef(true);
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
      if (message) {
        toast.success(`Найдено ${galleryFetch.totalHits} картинок`);
      }
     

        if (gallery) {
      
          setGallery(prevState => {
            return {
                totalHits: galleryFetch.totalHits,
                hits: [...prevState.hits, ...galleryFetch.hits],

            };
          });
        } else {
          setGallery({
            totalHits: galleryFetch.totalHits, hits: [...galleryFetch.hits]
          });
        }
        console.log(galleryFetch);
        console.log(gallery);
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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    setIsLoading(true);
    setGallery(null);
    setPage(1);
    getPhotos(query, 1);
  }, [query]);

  // useEffect(() => {
  //   getPhotos(query, page, false);
  // }, [page]);

  const tongleModal = () => {
    setShowModal(prevState => !prevState);
  };

  const addImageToModal = item => {
    setSelectedImage(item);
    tongleModal();
  };

  const loadMore = () => {
    setPage(prevState => {
      return prevState + 1;
    });
  };

  return (
    <>
      {showModal && <Modal image={selectedImage} onClose={tongleModal} />}
      {error && <h1>{error}</h1>}
      {gallery && (
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

// export class ImageGallery extends Component {
//   state = {
//     gallery: null,
//     error: null,
//     isLoading: false,
//     showModal: false,
//     isLoadMore: false,
//     selectedImage: null,
//     page: 1,
//   };

//   photosApiService = new PhotosApiService();

//   // async componentDidMount() {
//   //   this.setState({ isLoading: true });
//   //   await this.getPhotos('', false);
//   // }

//    componentDidUpdate(prevProps, prevState) {
//     const prevQuery = prevProps.query;
//     const nextQuery = this.props.query;
//     if (prevQuery !== nextQuery) {
//       this.setState({ isLoading: true, gallery: null, page: 1 });

//     this.getPhotos(nextQuery, 1);
//     }
//     if (prevState.page < this.state.page) {
//       this.setState({ isLoading: true });
//       this.getPhotos(nextQuery, this.state.page, false);
//     }
//   }

//   getPhotos = async (query, page, message = true) => {
//     try {
//       this.photosApiService.query = query;
//       this.photosApiService.page = page;
//       this.setState({ isLoadMore: false });
//       const gallery = await this.photosApiService.fetchPhotos();
//       if (gallery.totalHits === 0) {
//         throw new Error(`Ничего не найдено по запросу "${query}"`);
//       }
//       if (message) {
//         toast.success(`Найдено ${gallery.totalHits} картинок`);
//       }

//       if (this.state.gallery) {
//         this.setState(prevState => {
//           return {
//             gallery: {
//               totalHits: gallery.totalHits,
//               hits: [...prevState.gallery.hits, ...gallery.hits],
//             },
//           };
//         });
//       } else {
//         this.setState({
//           gallery: { totalHits: gallery.totalHits, hits: [...gallery.hits] },
//         });
//       }
//       this.photosApiService.totalPages = Math.ceil(
//         gallery.totalHits / this.photosApiService.perPage
//       );
//       if (this.photosApiService.totalPages > 1) {
//         this.setState({ isLoadMore: true });
//       }
//       if (this.photosApiService.page === this.photosApiService.totalPages) {
//         this.setState({ isLoadMore: false });
//       }
//     } catch (err) {
//       this.setState({ error: err.message });
//     } finally {
//       this.setState({ isLoading: false });
//     }
//   };

//   tongleModal = () => {
//     this.setState(({ showModal }) => ({
//       showModal: !showModal,
//     }));
//   };

//   addImageToModal = item => {
//     this.setState({ selectedImage: item });
//     this.tongleModal();
//   };

//   loadMore = () => {
//     // this.setState({ isLoading: true });
//     // this.getPhotos(this.props.query, false);
//     this.setState(prevState => {
//       return {
//         page: prevState.page + 1,
//       };
//     });
//   };

//   render() {
//     const { gallery, error, isLoadMore, isLoading, showModal, selectedImage } =
//       this.state;

//     return (
//       <>
//         {showModal && (
//           <Modal image={selectedImage} onClose={this.tongleModal} />
//         )}
//         {error && <h1>{error}</h1>}
//         {gallery && (
//           <Gallery className="gallery">
//             {gallery.hits.map(({ id, webformatURL, tags, largeImageURL }) => {
//               return (
//                 <ImageGalleryItem
//                   key={id}
//                   image={webformatURL}
//                   tag={tags}
//                   largeImage={largeImageURL}
//                   onClick={this.addImageToModal}
//                 />
//               );
//             })}
//           </Gallery>
//         )}
//         {isLoading && <Loader />}
//         {isLoadMore && <Button onLoadMore={this.loadMore}>LoadMore</Button>}
//       </>
//     );
//   }
// }
