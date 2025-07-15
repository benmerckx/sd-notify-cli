COSMOCC_DIR = ./cosmocc
COSMOCC_ZIP = $(COSMOCC_DIR)/cosmocc.zip
COSMOCC_BIN_PATH = $(COSMOCC_DIR)/bin/cosmocc
COSMOCC_EXTRACTED_STAMP = $(COSMOCC_DIR)/.extracted_stamp

COSMOCC = $(COSMOCC_BIN_PATH)
SRC = ./src/notify.c
BIN = ./bin/notify.com

all: $(BIN)

.PHONY: cosmocc_setup
cosmocc_setup: $(COSMOCC_EXTRACTED_STAMP)

$(COSMOCC_ZIP):
	mkdir -p $(dir $@)
	wget https://cosmo.zip/pub/cosmocc/cosmocc.zip -O $@

$(COSMOCC_EXTRACTED_STAMP): $(COSMOCC_ZIP)
	@echo "Unzipping $(COSMOCC_ZIP) to $(COSMOCC_DIR)..."
	mkdir -p $(COSMOCC_DIR)
	unzip -o $(COSMOCC_ZIP) -d $(COSMOCC_DIR)
	touch $@

$(BIN): $(SRC) $(COSMOCC_EXTRACTED_STAMP)
	mkdir -p $(dir $@)
	$(COSMOCC) -o $@ $<

clean:
	rm -f $(BIN)
	rm -rf $(COSMOCC_DIR)