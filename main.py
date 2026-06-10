import pandas as pd

meta = pd.read_csv("xclaim_sic.csv")
log = pd.read_csv("_results_log.csv")

# Normalize DOI in meta — strip the https://doi.org/ prefix
meta["doi_clean"] = meta["DOI"].str.replace("https://doi.org/", "", regex=False).str.strip()

# Keep only successful downloads
log_ok = log[log["status"] == "ok"][["doi", "file"]].copy()

# Merge
merged = meta.merge(log_ok, left_on="doi_clean", right_on="doi", how="inner")

# Keep only what we need
final = merged[["Title", "Author", "Year", "DOI", "file"]].rename(columns={"file": "xml_filename"})

print(f"Total papers with XML: {len(final)}")
print(final[["Title", "xml_filename"]].head(5))

final.to_csv("papers_with_paths.csv", index=False)
print("Saved papers_with_paths.csv")