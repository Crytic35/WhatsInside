def test_demo_products_listing(client):
    response = client.get("/api/demo/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 5
    ids = [p["id"] for p in products]
    assert "demo-shampoo" in ids
    assert "demo-food" in ids
    assert "demo-detergent" in ids

def test_demo_product_analysis_detail(client):
    response = client.get("/api/demo/products/demo-shampoo")
    assert response.status_code == 200
    data = response.json()
    assert data["product_name"] == "Clarifying Gentle Daily Shampoo"
    assert data["category"] == "cosmetics"
    assert len(data["ingredients"]) > 5
    assert "what_should_i_know" in data
    assert "just_tell_me_what_matters" in data
    assert "what_it_does" in data["just_tell_me_what_matters"]
    assert "what_we_dont_know" in data["just_tell_me_what_matters"]
    assert data["is_demo"] is True

def test_text_analysis_endpoint(client):
    payload = {
        "text": "Water, Glycerin, Niacinamide, Phenoxyethanol",
        "product_name": "Hydration Booster",
        "use_demo_fallback": True
    }
    response = client.post("/api/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["product_name"] == "Hydration Booster"
    assert len(data["ingredients"]) >= 4
    # Check that limitation regarding concentration is explicitly included
    assert "concentration" in data["limitations"].lower()

def test_image_analysis_endpoint(client):
    import io
    dummy_image = io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 200)
    files = {"file": ("label.png", dummy_image, "image/png")}
    response = client.post("/api/analyze/image", files=files, data={"fallback_demo": "true"})
    assert response.status_code == 200
    data = response.json()
    assert "Clarifying Gentle Daily Shampoo" in data["product_name"]
    assert len(data["ingredients"]) > 0
