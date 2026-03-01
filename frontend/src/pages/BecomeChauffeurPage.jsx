import { useState } from 'react';
import { DollarSign, Calendar, Users, Headphones, FileText, Shield, ChevronDown, X, Upload } from 'lucide-react';
import './BecomeChauffeurPage.css';

// Inline field error bubble (speech-bubble style with exclamation icon)
const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="field-error-bubble" role="alert">
      <span className="field-error-icon" aria-hidden="true">!</span>
      <span className="field-error-text">{message}</span>
    </div>
  );
};

const BecomeChauffeurPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    country: 'United States',
    city: '',
    countryCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    requirementsAccepted: false,
    profilePicture: null,
    driverLicense: null,
    chauffeurLicense: null,
    identityCard: null,
    vehicle: {
      model: '',
      year: '',
      color: '',
      registrationNumber: '',
      registrationCertificate: null,
      insuranceCertificate: null,
      vehiclePhoto: null,
    }
  });

  const approvedVehicles = [
    'Ford Expedition',
    'Mercedes-Benz Vito',
    'Mercedes-Benz EQE',
    'Land Rover Range Rover',
    'Mercedes-Benz GLE',
    'Genesis G90',
    'Mercedes-Benz E-Class',
    'BMW 5 series',
    'Audi A8',
    'Mercedes-Benz GLS',
    'Cadillac Escalade',
    'Chevrolet Tahoe',
    'Chevrolet Suburban',
    'BMW 7 series',
    'Mercedes-Benz EQV',
    'BMW i7',
    'Lucid Air',
    'GMC Yukon XL',
    'Audi A6',
    'Mercedes-Benz EQS',
    'Mercedes-Benz S-Class',
    'BMW i5',
    'GMC Yukon Denali',
    'Mercedes-Benz V-Class',
  ];

  const countries = [
    { name: 'United States', code: '+1' },
  ];

  const cities = {
    'United States': [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
      'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Austin',
      'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
      'Indianapolis', 'Seattle', 'Denver', 'Boston', 'Nashville', 'Detroit',
      'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee',
      'Albuquerque', 'Tucson', 'Fresno', 'Mesa', 'Sacramento', 'Atlanta',
      'Kansas City', 'Colorado Springs', 'Raleigh', 'Miami', 'Omaha', 'Long Beach',
      'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Tampa', 'Arlington',
      'New Orleans', 'Wichita', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim',
      'Honolulu', 'Santa Ana', 'St. Louis', 'Riverside', 'Corpus Christi', 'Pittsburgh',
      'Lexington', 'Anchorage', 'Stockton', 'Cincinnati', 'St. Paul', 'Toledo',
      'Newark', 'Greensboro', 'Plano', 'Henderson', 'Lincoln', 'Buffalo',
      'Fort Wayne', 'Jersey City', 'St. Petersburg', 'Chula Vista', 'Orlando',
      'Laredo', 'Norfolk', 'Chandler', 'Madison', 'Lubbock', 'Scottsdale',
      'Reno', 'Baltimore', 'Gilbert', 'Glendale', 'North Las Vegas', 'Winston-Salem',
      'Chesapeake', 'Irving', 'Hialeah', 'Garland', 'Fremont', 'Baton Rouge',
      'Richmond', 'Boise', 'San Bernardino', 'Birmingham', 'Spokane', 'Rochester',
      'Des Moines', 'Modesto', 'Fayetteville', 'Tacoma', 'Oxnard', 'Fontana',
      'Columbus', 'Montgomery', 'Moreno Valley', 'Shreveport', 'Aurora', 'Yonkers',
      'Charleston', 'Oceanside', 'Grand Prairie', 'Rancho Cucamonga', 'Santa Clarita',
      'Port St. Lucie', 'Huntington Beach', 'Amarillo', 'Little Rock', 'Salt Lake City',
      'Grand Rapids', 'Tallahassee', 'Huntsville', 'Knoxville', 'Worcester',
      'Newport News', 'Brownsville', 'Santa Rosa', 'Overland Park', 'Providence',
      'Garden Grove', 'Santa Clara', 'Oklahoma City', 'Vancouver', 'Chattanooga',
      'Fort Lauderdale', 'Rockford', 'Tempe', 'Sioux Falls', 'Ontario', 'Springfield',
      'Cape Coral', 'Pembroke Pines', 'Elk Grove', 'Salinas', 'Palm Bay', 'Corona',
      'Eugene', 'Salem', 'Springfield', 'Manchester', 'Hollywood', 'Lakewood',
      'Kansas City', 'Escondido', 'Pomona', 'Pasadena', 'Joliet', 'Paterson',
      'Killeen', 'Bellevue', 'Macon', 'Rockford', 'Savannah', 'Bridgeport',
      'Torrance', 'McAllen', 'Syracuse', 'Surprise', 'Denton', 'Roseville',
      'Thornton', 'Miramar', 'Pasadena', 'Mesquite', 'Olathe', 'Dayton',
      'Hampton', 'Warren', 'Midland', 'Waco', 'Charleston', 'Columbia',
      'Orange', 'Fullerton', 'Killeen', 'New Haven', 'Stamford', 'Vallejo',
      'Columbia', 'Fayetteville', 'Sterling Heights', 'Santa Maria', 'El Monte',
      'Round Rock', 'Wichita Falls', 'Green Bay', 'Davenport', 'West Valley City',
      'Cedar Rapids', 'Richardson', 'Lewisville', 'Antioch', 'College Station',
      'High Point', 'Pearland', 'Gainesville', 'Wilmington', 'Billings',
      'Rochester', 'Broken Arrow', 'Elgin', 'West Covina', 'Lakeland', 'Clarksville',
      'Clearwater', 'Evansville', 'Palm Coast', 'Norman', 'Richmond', 'Arvada',
      'Edison', 'Allen', 'Abilene', 'League City', 'Tyler', 'Nampa',
      'Boulder', 'Sugar Land', 'Daly City', 'Lewisville', 'Hillsboro', 'San Angelo',
      'Kenosha', 'Federal Way', 'Largo', 'Renton', 'South Bend', 'Vista',
      'Tuscaloosa', 'Clinton', 'Edinburg', 'San Mateo', 'Vacaville', 'Carmel',
      'Spokane Valley', 'San Leandro', 'Rapid City', 'Lake Forest', 'Orem',
      'Bend', 'Lynn', 'Sandy Springs', 'Jurupa Valley', 'Burbank', 'Greenville',
      'Wichita Falls', 'Westminster', 'Midland', 'Charleston', 'Murrieta',
      'Columbia', 'Miami Gardens', 'Everett', 'Downey', 'Lowell', 'Centennial',
      'El Cajon', 'Richmond', 'Broken Arrow', 'Miami Beach', 'Rialto', 'Las Cruces',
      'San Marcos', 'Davenport', 'Bethlehem', 'Albany', 'Sparks', 'Sandy',
      'Trenton', 'Baldwin Park', 'San Tan Valley', 'Bellingham', 'Hoover',
      'Rochester', 'Folsom', 'Quincy', 'Lynn', 'New Bedford', 'Suffolk',
      'Manteca', 'Carson', 'Conroe', 'Livonia', 'Westminster', 'South Gate',
      'Tracy', 'Compton', 'Roseville', 'Thousand Oaks', 'Roswell', 'Beaumont',
      'El Monte', 'Indio', 'Menifee', 'Victorville', 'Berkeley', 'Fairfield',
      'Napa', 'Murfreesboro', 'High Point', 'Downey', 'Elgin', 'Wilmington',
      'Westminster', 'Arlington', 'Midland', 'Wichita Falls', 'Norman',
      'Port Arthur', 'Carson City', 'Manchester', 'Binghamton', 'St. Joseph',
      'Albany', 'Valdosta', 'Lawrence', 'Lawton', 'Morgantown', 'Pueblo',
      'Eau Claire', 'Fargo', 'Grand Forks', 'Athens', 'Columbia', 'Dover',
      'Augusta', 'Montgomery', 'Frankfort', 'Pierre', 'Helena', 'Concord',
      'Harrisburg', 'Hartford', 'Dover', 'Annapolis', 'Lansing', 'Springfield',
      'Olympia', 'Salem', 'Boise', 'Cheyenne', 'Bismarck', 'Juneau',
      'Santa Fe', 'Phoenix', 'Salt Lake City', 'Denver', 'Austin', 'Nashville',
      'Raleigh', 'Columbus', 'Indianapolis', 'Tallahassee', 'Atlanta', 'Boston',
      'Washington DC', 'Sacramento', 'Albany', 'Trenton', 'Harrisburg', 'Dover',
    ].filter((city, index, self) => self.indexOf(city) === index).sort(),
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name.includes('.')) {
          const [parent, child] = name.split('.');
          setFormData(prev => ({
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: reader.result
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: reader.result
          }));
        }
        // Mark file as uploaded
        setUploadedFiles(prev => ({
          ...prev,
          [name]: file.name
        }));
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    setFieldErrors({});
    if (step === 1) {
      const err = {};
      if (!formData.country) err.country = 'Please fill out this field.';
      if (!formData.city) err.city = 'Please fill out this field.';
      if (Object.keys(err).length) {
        setFieldErrors(err);
        return;
      }
    } else if (step === 2) {
      if (!formData.requirementsAccepted) {
        setFieldErrors({ requirementsAccepted: 'Please accept the requirements to continue.' });
        return;
      }
    } else if (step === 3) {
      const err = {};
      if (!formData.firstName?.trim()) err.firstName = 'Please fill out this field.';
      if (!formData.lastName?.trim()) err.lastName = 'Please fill out this field.';
      if (!formData.email?.trim()) err.email = 'Please fill out this field.';
      if (!formData.phone?.trim()) err.phone = 'Please fill out this field.';
      if (!formData.password) err.password = 'Please fill out this field.';
      if (formData.password !== formData.confirmPassword) err.confirmPassword = 'Passwords do not match.';
      if (!formData.confirmPassword) err.confirmPassword = err.confirmPassword || 'Please fill out this field.';
      if (Object.keys(err).length) {
        setFieldErrors(err);
        return;
      }
    } else if (step === 4) {
      const err = {};
      if (!formData.vehicle.model?.trim()) err['vehicle.model'] = 'Please fill out this field.';
      if (!formData.vehicle.year) err['vehicle.year'] = 'Please fill out this field.';
      if (!formData.vehicle.color?.trim()) err['vehicle.color'] = 'Please fill out this field.';
      if (!formData.vehicle.registrationNumber?.trim()) err['vehicle.registrationNumber'] = 'Please fill out this field.';
      if (Object.keys(err).length) {
        setFieldErrors(err);
        return;
      }
    }
    setFieldErrors({});
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setFieldErrors({});
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!formData.firstName?.trim()) err.firstName = 'Please fill out this field.';
    if (!formData.lastName?.trim()) err.lastName = 'Please fill out this field.';
    if (!formData.email?.trim()) err.email = 'Please fill out this field.';
    if (!formData.phone?.trim()) err.phone = 'Please fill out this field.';
    if (!formData.profilePicture) err.profilePicture = 'Please fill out this field.';
    if (!formData.driverLicense) err.driverLicense = 'Please fill out this field.';
    if (!formData.chauffeurLicense) err.chauffeurLicense = 'Please fill out this field.';
    if (!formData.identityCard) err.identityCard = 'Please fill out this field.';
    if (!formData.vehicle.model?.trim()) err['vehicle.model'] = 'Please fill out this field.';
    if (!formData.vehicle.year) err['vehicle.year'] = 'Please fill out this field.';
    if (!formData.vehicle.color?.trim()) err['vehicle.color'] = 'Please fill out this field.';
    if (!formData.vehicle.registrationNumber?.trim()) err['vehicle.registrationNumber'] = 'Please fill out this field.';
    if (!formData.vehicle.registrationCertificate) err['vehicle.registrationCertificate'] = 'Please fill out this field.';
    if (!formData.vehicle.insuranceCertificate) err['vehicle.insuranceCertificate'] = 'Please fill out this field.';
    if (!formData.vehicle.vehiclePhoto) err['vehicle.vehiclePhoto'] = 'Please fill out this field.';
    if (Object.keys(err).length) {
      setFieldErrors(err);
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        countryCode: countries.find(c => c.name === formData.country)?.code,
        country: formData.country,
        city: formData.city,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        requirementsAccepted: formData.requirementsAccepted,
        profilePicture: formData.profilePicture,
        driverLicense: formData.driverLicense,
        chauffeurLicense: formData.chauffeurLicense,
        identityCard: formData.identityCard,
        vehicle: formData.vehicle,
      };

      const res = await fetch(`${API_BASE}/api/chauffeur/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        alert(data.message || 'Registration failed');
        console.error('Registration error:', data);
        return;
      }

      setIsLoading(false);
      alert('Registration submitted successfully! Pending admin approval.');
      
      if (data.token) {
        localStorage.setItem('chauffeurToken', data.token);
      }
      
      setShowRegistration(false);
      setStep(1);
      setFieldErrors({});
      setUploadedFiles({});
      setFormData({
        country: 'United States',
        city: '',
        countryCode: '+1',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        requirementsAccepted: false,
        profilePicture: null,
        driverLicense: null,
        chauffeurLicense: null,
        identityCard: null,
        vehicle: { model: '', year: '', color: '', registrationNumber: '', registrationCertificate: null, insuranceCertificate: null, vehiclePhoto: null },
      });
    } catch (err) {
      console.error('Registration error:', err);
      setIsLoading(false);
      alert('Network error: ' + err.message);
    }
  };

  const benefits = [
    {
      icon: <DollarSign size={32} />,
      title: 'Reliable payments',
      description: 'The amount shown will enable others to like communicate that will be transferred to your business. Rides booked immediately upon completion of the journey. Your local team. Monthly payments for your business account will be transferred to your bank account.'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Complete schedule flexibility',
      description: 'Select your rides through our innovative analytic. Adjust your own schedule and commission whenever and wherever you want—days, work nights, take you will advance, location, and vehicle type. We don\'t require you to, choose business, hourly bookings. Say when you are.'
    },
    {
      icon: <Users size={32} />,
      title: 'Join an international crew',
      description: 'As a member of the Blacklane crew, you\'ll be able to pay and get the best of it! All of our standards, follow guidelines and rides for our partners and their guests in over 50 countries.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Superior account management',
      description: 'Whether you\'re a dispatcher assigning rides to your crew or an owner-operator on the go with active spare time, our app will make managing and charging more easier than ever before. Easily manage all your rides with a few taps or clicks.'
    },
    {
      icon: <Headphones size={32} />,
      title: 'Dedicated support team',
      description: 'Alongside our 24/7 Customer Care who help with navigating reporting rides, our Partner Support Team can assist 24/5 for onboarding, general inquiries and account needs. Plus, they are on your fingertips at our Partner Help Chatbot.'
    }
  ];

  const requirements = [
    'Professional chauffeur license and insurance for all chauffeurs and vehicles',
    'A minimum of three clean, undamaged, smoke-free, and in full compliance functioning sedans or SUVs',
    'Completion must have up-to-date with area standards and proficient and ensure vehicle quality'
  ];

  const onboardingSteps = [
    'Submit your application',
    'Upload your required documents',
    'Upload your documentation for the cars want to receive',
    'Complete the licensing checklist and follow up their assistance via support',
    'Accept your first ride!'
  ];

  const faqs = [
    {
      question: 'Can anyone become a Rideserene partner?',
      answer: 'To become a Rideserene partner, you need to have a professional chauffeur license, appropriate insurance, and meet our vehicle standards. We welcome both individual chauffeurs and fleet operators.'
    },
    {
      question: 'How many rides can I do with Rideserene per month?',
      answer: 'There is no limit to the number of rides you can accept. You have complete flexibility to set your own schedule and accept as many rides as you wish.'
    },
    {
      question: 'How do I get paid?',
      answer: 'Payments are processed monthly and transferred directly to your bank account. You\'ll receive detailed statements showing all completed rides and earnings.'
    },
    {
      question: 'Which vehicles can I use to work with Rideserene?',
      answer: 'We accept premium sedans and SUVs that are no more than 5 years old, well-maintained, smoke-free, and meet our quality standards. Popular models include Mercedes E-Class, BMW 5 Series, and similar vehicles.'
    },
    {
      question: 'How do I apply to partner with Rideserene?',
      answer: 'Click the "Apply now" button on this page to start your application. You\'ll need to provide your professional details, license information, and vehicle documentation.'
    },
    {
      question: 'Does Rideserene work with electric vehicles?',
      answer: 'Yes! We actively encourage our partners to use electric and hybrid vehicles as part of our commitment to sustainability.'
    }
  ];

  return (
    <div className="become-chauffeur-page">
      {/* Hero Section */}
      <section className="hero-chauffeur-section">
        <div className="hero-chauffeur-overlay"></div>
        <div className="hero-chauffeur-content">
          <div className="container">
            <div className="hero-chauffeur-text">
              <h1 className="hero-chauffeur-title">Become a Chauffeur Partner</h1>
              <button className="apply-now-btn-hero" onClick={() => setShowRegistration(true)}>Apply now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Step Registration Modal */}
      {showRegistration && (
        <div className="registration-modal-overlay">
          <div className="registration-modal">
            <button className="modal-close-btn" onClick={() => { setFieldErrors({}); setShowRegistration(false); }}>
              <X size={24} />
            </button>

            <div className="registration-header">
              <h2 className="registration-title">Rideserene PARTNER</h2>
              <h3 className="registration-subtitle">Register</h3>
            </div>

            {/* Step 1: Country & City Selection */}
            {step === 1 && (
              <form className="registration-form">
                <div className="form-group form-group-with-error">
                  <label>Select Country</label>
                  <FieldError message={fieldErrors.country} />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`form-select ${fieldErrors.country ? 'input-has-error' : ''}`}
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group form-group-with-error">
                  <label>Select City</label>
                  <FieldError message={fieldErrors.city} />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`form-select ${fieldErrors.city ? 'input-has-error' : ''}`}
                    disabled={!formData.country}
                  >
                    <option value="">-- Select City --</option>
                    {formData.country && cities[formData.country]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </form>
            )}

            {/* Step 2: Requirements Acceptance */}
            {step === 2 && (
              <form className="registration-form">
                <div className="requirements-box">
                  <h4>Requirements to Drive with Rideserene</h4>
                  <ul className="requirements-list">
                    <li>Valid driver's license (minimum 3 years driving experience)</li>
                    <li>Chauffeurs in NYC must hold two valid, active licenses (e.g. state driver license and TLC/chauffeur license)—both must be valid and active at all times</li>
                    <li>Professional vehicle</li>
                    <li>Vehicle insurance certificate</li>
                    <li>Commercial registration documents</li>
                    <li>Fluent English communication skills</li>
                    <li>Clean driving record</li>
                  </ul>
                </div>

                <div className="form-group form-group-with-error checkbox">
                  <FieldError message={fieldErrors.requirementsAccepted} />
                  <input
                    type="checkbox"
                    name="requirementsAccepted"
                    checked={formData.requirementsAccepted}
                    onChange={handleInputChange}
                    id="requirements-checkbox"
                    className={fieldErrors.requirementsAccepted ? 'input-has-error' : ''}
                  />
                  <label htmlFor="requirements-checkbox">I confirm I meet all requirements</label>
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-next"
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Personal Details */}
            {step === 3 && (
              <form className="registration-form">
                <div className="form-row">
                  <div className="form-group form-group-with-error">
                    <label>First Name</label>
                    <FieldError message={fieldErrors.firstName} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.firstName ? 'input-has-error' : ''}`}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-group form-group-with-error">
                    <label>Last Name</label>
                    <FieldError message={fieldErrors.lastName} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.lastName ? 'input-has-error' : ''}`}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="form-group form-group-with-error">
                  <label>Email</label>
                  <FieldError message={fieldErrors.email} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.email ? 'input-has-error' : ''}`}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group form-group-with-error">
                  <label>Phone Number</label>
                  <FieldError message={fieldErrors.phone} />
                  <div className="phone-input-group">
                    <span className="country-code">
                      {countries.find(c => c.name === formData.country)?.code || '+966'}
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.phone ? 'input-has-error' : ''}`}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group form-group-with-error">
                    <label>Password</label>
                    <FieldError message={fieldErrors.password} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.password ? 'input-has-error' : ''}`}
                      placeholder="Create password"
                    />
                  </div>
                  <div className="form-group form-group-with-error">
                    <label>Confirm Password</label>
                    <FieldError message={fieldErrors.confirmPassword} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors.confirmPassword ? 'input-has-error' : ''}`}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="form-group form-group-with-error">
                  <label>Profile Picture</label>
                  <FieldError message={fieldErrors.profilePicture} />
                  <label className="file-upload-label">
                    <Upload size={20} />
                    <span>Upload Profile Photo</span>
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleFileChange}
                      accept="image/*"
                      hidden
                    />
                  </label>
                  {uploadedFiles['profilePicture'] && (
                    <div className="uploaded-file-info">{uploadedFiles['profilePicture']}</div>
                  )}
                </div>

                <p className="license-requirement-note">
                  Chauffeurs in NYC carry two licenses (e.g. state driver license and TLC/chauffeur license). Both must be valid and active. Please upload both below.
                </p>
                <div className="form-row">
                  <div className="form-group form-group-with-error">
                    <label>Driver License (1st license)</label>
                    <FieldError message={fieldErrors.driverLicense} />
                    <label className="file-upload-label">
                      <Upload size={20} />
                      <span>Upload License</span>
                      <input
                        type="file"
                        name="driverLicense"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        hidden
                      />
                    </label>
                    {uploadedFiles['driverLicense'] && (
                      <div className="uploaded-file-info">{uploadedFiles['driverLicense']}</div>
                    )}
                  </div>
                  <div className="form-group form-group-with-error">
                    <label>Chauffeur License (2nd license, e.g. TLC)</label>
                    <FieldError message={fieldErrors.chauffeurLicense} />
                    <label className="file-upload-label">
                      <Upload size={20} />
                      <span>Upload License</span>
                      <input
                        type="file"
                        name="chauffeurLicense"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        hidden
                      />
                    </label>
                    {uploadedFiles['chauffeurLicense'] && (
                      <div className="uploaded-file-info">{uploadedFiles['chauffeurLicense']}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-with-error">
                    <label>Identity Card</label>
                    <FieldError message={fieldErrors.identityCard} />
                    <label className="file-upload-label">
                      <Upload size={20} />
                      <span>Upload ID</span>
                      <input
                        type="file"
                        name="identityCard"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        hidden
                      />
                    </label>
                    {uploadedFiles['identityCard'] && (
                      <div className="uploaded-file-info">{uploadedFiles['identityCard']}</div>
                    )}
                  </div>
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-next"
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Vehicle Information */}
            {step === 4 && (
              <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-group form-group-with-error">
                  <label>Vehicle Model</label>
                  <FieldError message={fieldErrors['vehicle.model']} />
                  <input
                    type="text"
                    name="vehicle.model"
                    value={formData.vehicle.model}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors['vehicle.model'] ? 'input-has-error' : ''}`}
                    placeholder="e.g., Mercedes E-Class, BMW 5 Series"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group form-group-with-error">
                    <label>Vehicle Year</label>
                    <FieldError message={fieldErrors['vehicle.year']} />
                    <input
                      type="number"
                      name="vehicle.year"
                      value={formData.vehicle.year}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors['vehicle.year'] ? 'input-has-error' : ''}`}
                      placeholder="e.g., 2020"
                      min={1990}
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="form-group form-group-with-error">
                    <label>Vehicle Color</label>
                    <FieldError message={fieldErrors['vehicle.color']} />
                    <input
                      type="text"
                      name="vehicle.color"
                      value={formData.vehicle.color}
                      onChange={handleInputChange}
                      className={`form-input ${fieldErrors['vehicle.color'] ? 'input-has-error' : ''}`}
                      placeholder="e.g., Black, Silver, White"
                    />
                  </div>
                </div>

                <div className="form-group form-group-with-error">
                  <label>Registration Number</label>
                  <FieldError message={fieldErrors['vehicle.registrationNumber']} />
                  <input
                    type="text"
                    name="vehicle.registrationNumber"
                    value={formData.vehicle.registrationNumber}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors['vehicle.registrationNumber'] ? 'input-has-error' : ''}`}
                    placeholder="Enter registration number"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group form-group-with-error">
                    <label>Registration Certificate</label>
                    <FieldError message={fieldErrors['vehicle.registrationCertificate']} />
                    <label className="file-upload-label">
                      <Upload size={20} />
                      <span>Upload Certificate</span>
                      <input
                        type="file"
                        name="vehicle.registrationCertificate"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        hidden
                      />
                    </label>
                    {uploadedFiles['vehicle.registrationCertificate'] && (
                      <div className="uploaded-file-info">{uploadedFiles['vehicle.registrationCertificate']}</div>
                    )}
                  </div>
                  <div className="form-group form-group-with-error">
                    <label>Insurance Certificate</label>
                    <FieldError message={fieldErrors['vehicle.insuranceCertificate']} />
                    <label className="file-upload-label">
                      <Upload size={20} />
                      <span>Upload Insurance</span>
                      <input
                        type="file"
                        name="vehicle.insuranceCertificate"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        hidden
                      />
                    </label>
                    {uploadedFiles['vehicle.insuranceCertificate'] && (
                      <div className="uploaded-file-info">{uploadedFiles['vehicle.insuranceCertificate']}</div>
                    )}
                  </div>
                </div>

                <div className="form-group form-group-with-error">
                  <label>Vehicle Photo</label>
                  <FieldError message={fieldErrors['vehicle.vehiclePhoto']} />
                  <label className="file-upload-label">
                    <Upload size={20} />
                    <span>Upload Vehicle Photo</span>
                    <input
                      type="file"
                      name="vehicle.vehiclePhoto"
                      onChange={handleFileChange}
                      accept="image/*"
                      hidden
                    />
                  </label>
                  {uploadedFiles['vehicle.vehiclePhoto'] && (
                    <div className="uploaded-file-info">{uploadedFiles['vehicle.vehiclePhoto']}</div>
                  )}
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>

                <p className="login-link">
                  Already have an account? <a href="/chauffeur-login">Sign in</a>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Intro Section */}
      <section className="intro-section section">
        <div className="container">
          <h2 className="section-title-chauffeur">Grow your business with Rideserene</h2>
          <p className="section-description-chauffeur">
            Rideserene app and web-portal connect licensed and insured chauffeur partners with a global client base of sophisticated 
            business travelers and leisure travelers. You can add rides to your calendar as you could more sources your main source or relay less 
            on other sources. We are committed to supporting our chauffeurs with service quality standards, marketing, and technology that help 
            you cater to chauffeurs with ensuring exceptional service for guests.
          </p>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial-section section">
        <div className="container">
          <div className="testimonial-box">
            <p className="testimonial-quote">
              "Rideserene is 60% of my revenue. I've grown from 2 to 20 chauffeurs and have 10 vehicles from working with them."
            </p>
            <p className="testimonial-author">Angel T., Rideserene chauffeur, Madrid</p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="benefits-section section">
        <div className="container">
          <div className="benefits-grid-chauffeur">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card-chauffeur">
                <div className="benefit-icon-chauffeur">{benefit.icon}</div>
                <h3 className="benefit-title-chauffeur">{benefit.title}</h3>
                <p className="benefit-description-chauffeur">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="requirements-section section">
        <div className="container">
          <div className="requirements-content">
            <div className="requirements-image">
              <img src="/images/chauffeur-loading.jpg" alt="Professional Chauffeur" />
            </div>
            <div className="requirements-text">
              <h2 className="requirements-title">Requirements</h2>
              <p className="requirements-intro">
                To join our select network of professional chauffeurs and transport for all chauffeurs and vehicles:
              </p>
              <ul className="requirements-list">
                {requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
              <p className="requirements-note">
                Note: Each city or country may have specific legal for your business there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Section */}
      <section className="onboarding-section section">
        <div className="container">
          <div className="onboarding-content">
            <div className="onboarding-text">
              <h2 className="onboarding-title">Onboarding</h2>
              <ol className="onboarding-steps">
                {onboardingSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <button type="button" className="apply-btn-onboarding" onClick={() => setShowRegistration(true)}>Apply now</button>
            </div>
            <div className="onboarding-image">
              <img src="/images/chauffeur-car.jpg" alt="Chauffeur with Vehicle" />
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="sustainability-section section">
        <div className="container">
          <div className="sustainability-content">
            <div className="sustainability-image">
              <img src="/images/electric-vehicle.jpg" alt="Electric Vehicle" />
            </div>
            <div className="sustainability-text">
              <h2 className="sustainability-title">Driving a sustainable future</h2>
              <p className="sustainability-description">
                As pioneers of sustainable chauffeuring, we're committed to reducing travel's impact in all our cities, offering 
                moving toward making all of our cities electric. Our acquisition of business towards Rideserene chauffeur service 
                has been one of our first major sustainability commitments. Since 2018, Rideserene has increased the use of hybrid 
                and electric cars in our offering in Paris, some cities drive 24/7 in carbon offset and we're working on offsetting all 
                of our carbon emissions since the company founding in 2011.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-chauffeur-section section">
        <div className="container">
          <div className="faq-chauffeur-content">
            <div className="faq-chauffeur-list">
              <h2>Frequently asked questions</h2>
              {faqs.map((faq, index) => (
                <div key={index} className="faq-chauffeur-item">
                  <button 
                    className="faq-chauffeur-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`faq-chauffeur-icon ${openFaq === index ? 'open' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="faq-chauffeur-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="faq-chauffeur-image">
              <img src="/images/woman-professional.jpg" alt="Professional Chauffeur" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeChauffeurPage;
