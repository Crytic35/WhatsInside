def test_known_ingredient_lookup(client):
    response = client.get("/api/ingredients/Glycerin")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["ingredient"]["canonical_name"] == "Glycerin"
    assert data["ingredient"]["evidence_level"] == "HIGH"
    assert len(data["ingredient"]["source_urls"]) > 0

def test_alias_ingredient_lookup(client):
    response = client.get("/api/ingredients/sles")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["ingredient"]["canonical_name"] == "Sodium Laureth Sulfate"

def test_unknown_ingredient_lookup_strictly_disclosed(client):
    response = client.get("/api/ingredients/ExtraterrestrialPolymerXYZ99")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is False
    assert data["ingredient"]["evidence_level"] == "UNKNOWN"
    assert data["ingredient"]["concern_level"] == "INSUFFICIENT INFORMATION"
    assert "Ingredient identified, but evidence is not currently available" in data["ingredient"]["known_concerns"]
    # Ensure no fabricated sources
    assert data["ingredient"]["source_urls"] == []
