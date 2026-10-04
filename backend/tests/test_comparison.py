def test_product_comparison_endpoint(client):
    payload = {
        "product_a_id": "demo-shampoo",
        "product_b_id": "demo-cosmetic"
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Clarifying Gentle Daily Shampoo" in data["product_a_name"]
    assert "Restorative Barrier Hydrating Serum" in data["product_b_name"]
    assert len(data["shared_ingredients"]) > 0
    # Both contain Glycerin, Citric Acid, Phenoxyethanol
    shared_names = [i["canonical_name"] for i in data["shared_ingredients"]]
    assert "Glycerin" in shared_names
    assert "preference_verdict" in data
    assert "safety_philosophy_reminder" in data
    # Ensure it avoids simplistic claims like "safer" in favor of preference matching
    assert "safer" not in data["safety_philosophy_reminder"].lower() or "not an absolute binary" in data["safety_philosophy_reminder"].lower()
