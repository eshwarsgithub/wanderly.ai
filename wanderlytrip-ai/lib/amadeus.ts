// Amadeus Self-Service API helper
// Get free demo keys at: https://developers.amadeus.com

interface AmadeusTokenResponse {
  access_token: string;
  expires_in: number;
}

interface FlightOffer {
  id: string;
  price: { total: string; currency: string };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }>;
  }>;
  numberOfBookableSeats: number;
}

interface HotelOffer {
  hotel: {
    hotelId: string;
    name: string;
    rating: string;
    cityCode: string;
    address: { lines: string[]; cityName: string; countryCode: string };
  };
  offers: Array<{
    id: string;
    price: { total: string; currency: string };
    room: { description: { text: string } };
    checkInDate: string;
    checkOutDate: string;
  }>;
}

class AmadeusClient {
  private baseUrl = "https://test.api.amadeus.com";
  private token: string | null = null;
  private tokenExpiry: number = 0;

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Amadeus API credentials not configured");
    }

    const response = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) throw new Error("Failed to get Amadeus token");

    const data = (await response.json()) as AmadeusTokenResponse;
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return this.token;
  }

  async searchFlights(params: {
    originCode: string;      // IATA airport code
    destinationCode: string; // IATA airport code
    departureDate: string;   // YYYY-MM-DD
    adults: number;
    maxResults?: number;
  }): Promise<FlightOffer[]> {
    const token = await this.getToken();

    const url = new URL(`${this.baseUrl}/v2/shopping/flight-offers`);
    url.searchParams.set("originLocationCode", params.originCode);
    url.searchParams.set("destinationLocationCode", params.destinationCode);
    url.searchParams.set("departureDate", params.departureDate);
    url.searchParams.set("adults", String(params.adults));
    url.searchParams.set("max", String(params.maxResults ?? 5));
    url.searchParams.set("currencyCode", "USD");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data ?? []) as FlightOffer[];
  }

  async searchHotels(params: {
    cityCode: string;    // IATA city code
    checkInDate: string; // YYYY-MM-DD
    checkOutDate: string;
    adults: number;
    maxResults?: number;
  }): Promise<HotelOffer[]> {
    const token = await this.getToken();

    // Step 1: get hotel list for city
    const listUrl = new URL(`${this.baseUrl}/v1/reference-data/locations/hotels/by-city`);
    listUrl.searchParams.set("cityCode", params.cityCode);
    listUrl.searchParams.set("radius", "5");
    listUrl.searchParams.set("radiusUnit", "KM");
    listUrl.searchParams.set("ratings", "3,4,5");

    const listResponse = await fetch(listUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!listResponse.ok) return [];

    const listData = await listResponse.json();
    const hotelIds = (listData.data ?? [])
      .slice(0, params.maxResults ?? 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((h: any) => h.hotelId)
      .join(",");

    if (!hotelIds) return [];

    // Step 2: get offers for those hotels
    const offersUrl = new URL(`${this.baseUrl}/v3/shopping/hotel-offers`);
    offersUrl.searchParams.set("hotelIds", hotelIds);
    offersUrl.searchParams.set("checkInDate", params.checkInDate);
    offersUrl.searchParams.set("checkOutDate", params.checkOutDate);
    offersUrl.searchParams.set("adults", String(params.adults));
    offersUrl.searchParams.set("currencyCode", "USD");

    const offersResponse = await fetch(offersUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!offersResponse.ok) return [];

    const offersData = await offersResponse.json();
    return (offersData.data ?? []) as HotelOffer[];
  }
}

// Singleton client
export const amadeus = new AmadeusClient();
export type { FlightOffer, HotelOffer };
