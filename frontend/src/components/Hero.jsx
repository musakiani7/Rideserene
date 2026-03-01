import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Info, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AutocompleteInput from './AutocompleteInput';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();
  const [rideType, setRideType] = useState('one-way');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    duration: '2' // Duration in hours for "By the hour"
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // basic validation
    if (!formData.from) {
      alert('Please enter a pickup location (From).');
      return;
    }
    if (rideType === 'one-way' && !formData.to) {
      alert('Please enter a destination (To).');
      return;
    }
    if (rideType === 'by-hour' && !formData.to) {
      alert('Please enter a drop-off location (To).');
      return;
    }

    // Build query string
    const params = new URLSearchParams();
    params.set('rideType', rideType);
    params.set('from', formData.from);
    if (rideType === 'one-way') params.set('to', formData.to);
    if (rideType === 'by-hour' && formData.to) params.set('to', formData.to);
    if (formData.date) params.set('date', formData.date);
    if (formData.time) params.set('time', formData.time);
    if (rideType === 'by-hour') params.set('duration', formData.duration);

    navigate(`/search?${params.toString()}`);
  };

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const defaultDate = formData.date || today;

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-image-overlay">
          <h1 className="hero-title">{t('Premium Chauffeur Services')}</h1>
          <p className="hero-subtitle">{t('Ride Serene')}</p>
        </div>
      </div>
      
      <div className="hero-container">
        <div className="booking-form-card">
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="ride-type-cards">
                <button
                  type="button"
                  className={`ride-type-card ${rideType === 'one-way' ? 'active' : ''}`}
                  onClick={() => setRideType('one-way')}
                >
                  <div className="card-content">
                    <ArrowRight size={24} />
                    <span>{t('One Way')}</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`ride-type-card ${rideType === 'by-hour' ? 'active' : ''}`}
                  onClick={() => setRideType('by-hour')}
                >
                  <div className="card-content">
                    <Clock size={24} />
                    <span>{t('By The Hour')}</span>
                  </div>
                </button>
              </div>

              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="from">
                    <MapPin size={18} />
                    {t('From')}
                  </label>
                  <AutocompleteInput
                    id="from"
                    name="from"
                    placeholder="Pick up Location"
                    value={formData.from}
                    onChange={handleInputChange}
                    returnPlaceDetails={true}
                    onSelect={({ prediction, details }) => {
                      // store place id and coordinates when available
                      setFormData((prev) => ({
                        ...prev,
                        from: (details && details.formatted_address) || (prediction && prediction.description) || prev.from,
                        fromPlaceId: prediction?.place_id || prev.fromPlaceId,
                        fromLat: details && details.geometry && details.geometry.location ? details.geometry.location.lat() : prev.fromLat,
                        fromLng: details && details.geometry && details.geometry.location ? details.geometry.location.lng() : prev.fromLng,
                      }));
                    }}
                  />
                </div>

                {rideType === 'one-way' && (
                  <div className="form-group">
                    <label htmlFor="to">
                      <MapPin size={18} />
                      {t('To')}
                    </label>
                    <AutocompleteInput
                      id="to"
                      name="to"
                      placeholder="airport, city, hotel"
                      value={formData.to}
                      onChange={handleInputChange}
                      returnPlaceDetails={true}
                      onSelect={({ prediction, details }) => {
                        setFormData((prev) => ({
                          ...prev,
                          to: (details && details.formatted_address) || (prediction && prediction.description) || prev.to,
                          toPlaceId: prediction?.place_id || prev.toPlaceId,
                          toLat: details && details.geometry && details.geometry.location ? details.geometry.location.lat() : prev.toLat,
                          toLng: details && details.geometry && details.geometry.location ? details.geometry.location.lng() : prev.toLng,
                        }));
                      }}
                    />
                  </div>
                )}

                {rideType === 'by-hour' && (
                  <div className="form-group">
                    <label className="to-field-label">
                      <MapPin size={18} />
                      {t('To')}
                    </label>
                    <AutocompleteInput
                      id="to-hourly"
                      name="to"
                      placeholder="airport, city, hotel"
                      value={formData.to}
                      onChange={handleInputChange}
                      returnPlaceDetails={true}
                      onSelect={({ prediction, details }) => {
                        setFormData((prev) => ({
                          ...prev,
                          to: (details && details.formatted_address) || (prediction && prediction.description) || prev.to,
                          toPlaceId: prediction?.place_id || prev.toPlaceId,
                          toLat: details && details.geometry && details.geometry.location ? details.geometry.location.lat() : prev.toLat,
                          toLng: details && details.geometry && details.geometry.location ? details.geometry.location.lng() : prev.toLng,
                        }));
                      }}
                    />
                  </div>
                )}

                {rideType === 'by-hour' && (
                  <div className="form-group duration-group">
                    <label className="duration-label">
                      <Clock size={18} />
                      {t('Duration')}
                    </label>
                    <div className="duration-counter">
                      <button
                        type="button"
                        className="duration-counter-btn"
                        onClick={() => setFormData((prev) => {
                          const n = Math.max(1, (parseInt(prev.duration, 10) || 2) - 1);
                          return { ...prev, duration: String(n) };
                        })}
                        aria-label="Decrease hours"
                      >
                        −
                      </button>
                      <div className="duration-counter-value">
                        <input
                          type="number"
                          name="duration"
                          min={1}
                          max={24}
                          value={formData.duration}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '') {
                              setFormData((prev) => ({ ...prev, duration: '1' }));
                              return;
                            }
                            const n = Math.min(24, Math.max(1, parseInt(v, 10) || 1));
                            setFormData((prev) => ({ ...prev, duration: String(n) }));
                          }}
                          className="duration-counter-input"
                          aria-label="Duration in hours"
                        />
                        <span className="duration-counter-unit">hours</span>
                      </div>
                      <button
                        type="button"
                        className="duration-counter-btn"
                        onClick={() => setFormData((prev) => {
                          const n = Math.min(24, (parseInt(prev.duration, 10) || 1) + 1);
                          return { ...prev, duration: String(n) };
                        })}
                        aria-label="Increase hours"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">
                      <Calendar size={18} />
                      {t('Date')}
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date || today}
                      onChange={handleInputChange}
                      min={today}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">
                      <Clock size={18} />
                      {t('Time')}
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Live preview of selected locations */}
              <div className="location-preview" style={{margin: '10px 0', padding: '8px 12px', background: '#f7f7f7', borderRadius: 6}}>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <div><strong>{t('From')}:</strong>&nbsp;{formData.from ? formData.from : '—'}</div>
                  {(rideType === 'one-way' || rideType === 'by-hour') && formData.to && (
                    <div><strong>{t('To')}:</strong>&nbsp;{formData.to}</div>
                  )}
                  {rideType === 'by-hour' && (
                    <div><strong>{t('duration')}:</strong>&nbsp;{formData.duration} {t('hours')}</div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary search-btn">
                {t('Search')}
              </button>
            </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;

