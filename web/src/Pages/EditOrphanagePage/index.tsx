import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { Map, Marker, TileLayer } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { FiPlus, FiX } from "react-icons/fi";
import mapIcon from '../../utils/mapIcon';
import '../../styles/pages/create-orphanage.css';
import '../../styles/pages/edit-orphanage-page.css';
import Sidebar from "../components/Sidebar";

import api from '../../services/api';
import { useHistory, useLocation, Link } from "react-router-dom";

const EditOrphanagePage: React.FC = () => {

  const [ position, setPosition ] = useState({
    latitude: 0,
    longitude: 0
  });

  const history = useHistory();
  const location = useLocation<any>();
  
  const { 
    id: apiId, 
    about: apiAbout, 
    images: apiImages, 
    instructions: apiInstructions, 
    latitude: apiLatitude, 
    longitude: apiLongitude, 
    name: apiName, 
    opening_hours: apiOpening_hours, 
    open_on_weekends: apiOpen_on_weekends, 
    whatsapp: apiWhatsapp
  } = location.state.orphanage;

  const [ name, setName ] = useState(apiName);
  const [ whatsapp, setWhatsapp ] = useState(apiWhatsapp);
  const [ about, setAbout ] = useState(apiAbout);
  const [ instructions, setInstructions ] = useState(apiInstructions);
  const [ opening_hours, setOpeningHours ] = useState(apiOpening_hours);
  const [ open_on_weekends, setOpenOnWeekends ] = useState(apiOpen_on_weekends);
  const [ images, setImages ] = useState<File[]>([]);
  const [ previewImages, setPreviewImages ] = useState<string[]>([]);
  const [ previewImagesFromApi, setPreviewImagesFromApi ] = useState<string[]>([]);

  const [ initialLocation, setInitialLocation ] = useState({
    initialLatitude: apiLatitude,
    initialLongitude: apiLongitude,
  });

  useEffect(() => {

    
    navigator.geolocation.getCurrentPosition((position) => {
      
      setInitialLocation({
        initialLatitude: apiLatitude,
        initialLongitude: apiLongitude,
      })

    });

  }, []);



  function handleMapClick(event: LeafletMouseEvent){
    const { lat, lng } = event.latlng;
    setPosition({
      latitude: lat,
      longitude: lng
    });
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const { latitude, longitude } = position;

    const data = new FormData();
    
    data.append('name', name);
    data.append('whatsapp', whatsapp);
    data.append('about', about);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('instructions', instructions);
    data.append('opening_hours', opening_hours);
    data.append('open_on_weekends', String(open_on_weekends));
    
    images.forEach(image => {
      data.append('images', image);
    })

    await api.post('orphanages', data);

    history.push('/dashboard');
    
  }
  
  
  function pushImagesPreviewFromApi(){
    let imagesArray: any[] = [];
    apiImages.map((image: any) => {
      imagesArray.push(image.url);
    })
    
    setPreviewImagesFromApi(imagesArray);
    setPreviewImages(imagesArray);
    
  }

  useEffect(() => {
    
    pushImagesPreviewFromApi();

  }, []);
  
  function handleSelectImages(event: ChangeEvent<HTMLInputElement>){
    if(!event.target.files)
    return
    
    const selectedImages = Array.from(event.target.files);
    
    setImages(selectedImages);
    
    const selectedImagesPreview = selectedImages.map(image => {
      return URL.createObjectURL(image);
    });

    setPreviewImages(previewImages.concat(selectedImagesPreview));

  }

  function deleteImage(e: FormEvent, imgIndexToDelete: any, arrayImages: any) {
    e.preventDefault();
    let previewImagesAfterDelete: any[] = [];

    arrayImages.map((img: any, index: any) => {
      if(index !== imgIndexToDelete){
        previewImagesAfterDelete.push(img);
      }
    })
    
    setPreviewImages(previewImagesAfterDelete);

  }
  
  return (
    
    <div id="page-create-orphanage">
    
      <Sidebar />

      <main>
        <form onSubmit={handleSubmit} className="create-orphanage-form">
          <fieldset>
            <legend>Dados</legend>

            {
              initialLocation.initialLatitude !== 0 && (
                <Map 
                center={[initialLocation.initialLatitude, initialLocation.initialLongitude]} 
                style={{ width: '100%', height: 280 }}
                zoom={15}
                onclick={handleMapClick}
              >
<TileLayer 
  url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
/>
                
                { 
                  position.latitude !== 0 && (
                    <Marker 
                    interactive={false} 
                    icon={mapIcon} 
                    position={[position.latitude, position.longitude]} /> 
                  )
                }

              </Map>
              )
            }

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input id="name"
              value={name}
              onChange={event => setName(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
              <textarea id="name" maxLength={300} 
              value={about}
              onChange={event => setAbout(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="whatsapp">Número de Whatsapp</label>
              <input id="Whatsapp"
              value={whatsapp}
              onChange={event => setWhatsapp(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="images-container">

                { previewImages.map((prevImage, index) => {
                  return (
                    <div className="img-delete-button-container">
                      <Link to="#" className="delete-button" onClick={(e) => { deleteImage(e, index, previewImages) }} >
                        <FiX size={30} color="#FF70A3" className="delete-img-icon" />
                      </Link>
                      <img key={prevImage} src={prevImage} alt={name}/>
                    </div>
                  )
                }) }

                <label htmlFor="image[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>

              </div>
              <input multiple onChange={handleSelectImages} type="file" id="image[]"/>

            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea 
              id="instructions"
              value={instructions}
              onChange={event => setInstructions(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input id="opening_hours"
              value={opening_hours}
              onChange={event => setOpeningHours(event.target.value)}              
              />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
               
                <button 
                type="button" 
                className={ open_on_weekends ? 'active' : '' }
                onClick={() => setOpenOnWeekends(true)}
                >
                  Sim
                </button>
                
                <button 
                type="button"
                className={ !open_on_weekends ? 'active' : '' }
                onClick={() => setOpenOnWeekends(false)}
                >
                  Não
                </button>

              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditOrphanagePage;
// return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;